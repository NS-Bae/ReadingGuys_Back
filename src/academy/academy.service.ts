import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { endOfMonth } from 'date-fns';

import { Academy } from "./academy.entity";
import { User } from "../users/users.entity";
import { EventLogs } from "src/eventlogs/eventlogs.entity";

import { UserType } from "src/others/other.types";

import { DeleteAcademyCheckedDto } from '../dto/deleteChecked.dto';
import { UpdateAcademyDto } from "../dto/update-academy.dto";
import { AddNewAcademyDto } from '../dto/create-academy.dto';

@Injectable()
export class AcademyService
{
  private readonly logger = new Logger(AcademyService.name);
  constructor(
    @InjectRepository(Academy)
    private academyRepository: Repository<Academy>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EventLogs)

    private dataSource: DataSource,
  ) {}

  //매월 첫째 날 00시 10분에 가동. 구독비용을 지불했는지의 상태값을 바꿈
  @Cron('10 0 1 * *')
  async checkExpiredAcademies()
  {
    const currentDate = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const expiredAcademies = await queryRunner.manager
        .createQueryBuilder(Academy, 'academy')
        .where('academy.endMonth < :currentDate', { currentDate })
        .andWhere('academy.paymentStatus = :paymentStatus', { paymentStatus: true })
        .getMany();

      if(expiredAcademies.length === 0)
      {
        console.log('만료된 학원이 없습니다.');

        await queryRunner.rollbackTransaction();
        return ;
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Academy)
        .set({paymentStatus: false})
        .where('academyId IN (:...academyIds)', {
          academyIds: expiredAcademies.map(academy => academy.academyId),
        })
        .execute();
      
      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ ok: false })
        .where('academyId IN (:...academyIds)', {
          academyIds: expiredAcademies.map(academy => academy.academyId),
        })
        .execute();

      await queryRunner.commitTransaction();
      console.log(`${expiredAcademies.length}개의 학원의 구독이 만료 되었습니다.`);
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      console.log('구독 갱신 중 오류 발생', error);
    }
    finally
    {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Academy[]>
  {
    return await this.academyRepository.find();
  }

  async findOne(hashedAcademyId: string): Promise<Academy>
  {
    return await this.academyRepository.findOne({where : {hashedAcademyId}});
  }

  async deleteData(deleteCheckedDto: DeleteAcademyCheckedDto): Promise<{ deletedCount: number }>
  {
    const { checkedRows } = deleteCheckedDto;

    if(checkedRows.length === 0)
    {
      throw new NotFoundException('삭제할 데이터가 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const deleteResult = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Academy)
        .whereInIds(
          checkedRows.map((row) => ({ heahedAcademyId: row.data1 })),
        )
        .execute();
      const deletedCount = deleteResult.affected || 0
      
      if(deletedCount > 0)
      {
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('EventLogs')
          .values(
            checkedRows.map((row) => ({
              hashedUserId: row.data2,
              heahedAcademyId: row.data1,
              eventType: 'academy-delete-success',
              encryptedDeviceInfo: row.data3,
              ivDeviceInfo: row.data4,
              authTagDeviceInfo: row.data5,
              encryptedIPAdress: row.data6,
              ivIPAdress: row.data7,
              authTagIPAdress: row.data8,
              eventTime: new Date(),
            })),
          )
          .execute();
      }

      await queryRunner.commitTransaction();
      return { deletedCount };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('정보 삭제중 오류가 발생해서 삭제에 실패했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  
  async updateNovation(updateAcademyDto: UpdateAcademyDto): Promise<{ updatedCount: number }>
  {
    const { checkedRows } = updateAcademyDto;
    const currentEndOfMonth = endOfMonth(new Date());

    if (!checkedRows || !Array.isArray(checkedRows) || checkedRows.length === 0) {
      throw new NotFoundException('갱신할 데이터가 없습니다.');
    }

    //Transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const updateAcademyResult = await queryRunner.manager
        .createQueryBuilder()
        .update(Academy)
        .set({
          paymentStatus: true,
          endMonth: currentEndOfMonth,
        })
        .where('academyId IN (:...academyIds)', {
          academyIds: checkedRows.map(row => row.data1),
        })
        .andWhere('academyName IN (:...academyNames)', {
          academyNames: checkedRows.map(row => row.data2),
        })        
        .execute();

      const updateUserResult = await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ok: true})
        .where('academyId IN (:...academyIds)', {
          academyIds: checkedRows.map(row => row.data1),
        })
        .execute();

      await queryRunner.commitTransaction();
      
      return {updatedCount: updateAcademyResult.affected || 0};
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();

      console.error('업데이트 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터 갱신중 오류가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }

  async registNewAcademy(addNewAcademyDto: AddNewAcademyDto): Promise<{createdCount: number, academies: Academy[]}>
  {
    const { data } = addNewAcademyDto;
    const currentEndOfMonth = endOfMonth(new Date());
    const today = new Date();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new NotFoundException('갱신할 데이터가 없습니다.');
    }
    //Transaction 시작
    const queryRunner = this.academyRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const academies = addNewAcademyDto.data.map((academyDto) => {
        if (!academyDto['1'] || !academyDto['2'])
        {
          throw new InternalServerErrorException('academyId 또는 academyName이 누락되었습니다.');
        }

        const academy = new Academy();
          academy.academyId = academyDto['1'];
          academy.academyName = academyDto['2'];
          academy.paymentStatus = true;
          academy.startMonth = today;
          academy.endMonth = currentEndOfMonth;

          return academy;
      });
      const createdAcademy = await queryRunner.manager.save(Academy, academies);

      await queryRunner.commitTransaction();

      return {createdCount: createdAcademy.length || 0, academies: createdAcademy};
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();

      console.error('업데이트 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터 갱신중 오류가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  //소속학원생숫자 구하기
  async getAcademyStudent(userInfo: string)
  {
    const teacher = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .select(["user.academy"])
      .where("user.id = :id", { id: userInfo })
      .getRawOne();
    const myAcademyId = teacher.AcademyID;

    const myAcademy = await this.academyRepository.findOne({where : {academyId : myAcademyId}});
    const myAcademyStudent = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where('user.academy = :academyId', { academyId: myAcademyId })
      .andWhere('user.userType = :userType', { userType: UserType.학생 })
      .getCount()
      
    return { myAcademy, myAcademyStudent };
  }
  //소속학원생리스트 구하기
  async getAcademyStudentList(userInfo: string)
  {
    const teacher = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .select(["user.academy"])
      .where("user.id = :id", { id: userInfo })
      .getRawOne();
    const myAcademyId = teacher.AcademyID;

    const myAcademy = await this.academyRepository.findOne({where : {academyId : myAcademyId}});
    const myAcademyStudent = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where('user.academy = :academyId', { academyId: myAcademyId })
      .getMany()
      
    return { myAcademyStudent };
  }
  //test
  /* async testCheckExpieredAcademies()
  {
    console.log('🔵 테스트 실행: 구독 만료 학원 처리');
    await this.checkExpiredAcademies();
    console.log('🟢 테스트 완료');
  } */
}