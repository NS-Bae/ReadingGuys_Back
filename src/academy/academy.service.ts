import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { endOfMonth } from 'date-fns';

import { Academy } from "./academy.entity";
import { User } from "../users/users.entity";

import { UserType } from "../others/other.types";

import { DeleteAcademyCheckedDto, RegistAcademyCheckedDto, UpdateAcademyPaidCheckedDto } from '../dto/multiChecked.dto';
import { RawLogInfoDto } from "../dto/log.dto";
import { decryptionAcademyDto, decryptionUserDto } from "../dto/return.dto";
import { JWTPayloadDto } from "../dto/other.dto";

import { EventLogsService } from "../eventlogs/eventlogs.service";
import { decryptionAES256GCM, encryptAES256GCM, hashSHA256 } from "../utils/encryption.service";

@Injectable()
export class AcademyService
{
  private readonly logger = new Logger(AcademyService.name);
  constructor(
    @InjectRepository(Academy)
    private academyRepository: Repository<Academy>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly eventLogsService: EventLogsService,
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
          academyIds: expiredAcademies.map(academy => academy.hashedAcademyId),
        })
        .execute();
      
      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ ok: false })
        .where('academyId IN (:...academyIds)', {
          academyIds: expiredAcademies.map(academy => academy.hashedAcademyId),
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
  refineDto(hashedUserId: string, rawInfo)
  {
    return {
      data1: hashedUserId,
      data2: rawInfo.rawInfo.deviceInfo,
      data3: rawInfo.rawInfo.IPA,
    };
  }

  async findAll(): Promise<decryptionAcademyDto[]>
  {
    const rawAcademies = await this.academyRepository.find();
    const academyList: decryptionAcademyDto[] = rawAcademies.map(item => ({
      hashedAcademyId: item.hashedAcademyId,
      academyName: decryptionAES256GCM(item.encryptedAcademyName, item.ivAcademyName, item.authTagAcademyName),
      paymentStatus: item.paymentStatus,
      startMonth: item.startMonth,
      endMonth: item.endMonth,
    }));

    return academyList;
  }

  async deleteData(deleteCheckedDto: DeleteAcademyCheckedDto, hashedUserId: string, rawInfo: RawLogInfoDto): Promise<{ deletedCount: number }>
  {
    const { checkedRows } = deleteCheckedDto;
    const logCommonData = this.refineDto(hashedUserId, rawInfo);

    if(checkedRows.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '학원삭제실패' }});
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
          checkedRows.map((row) => ({ hashedAcademyId: row.data1 })),
        )
        .execute();
      const deletedCount = deleteResult.affected || 0;

      await queryRunner.commitTransaction();
      
      if(deletedCount > 0)
      {
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '학원삭제성공' }});
      }

      return { deletedCount };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '학원삭제실패' }});
      throw new InternalServerErrorException('정보 삭제중 오류가 발생해서 삭제에 실패했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  //구독상태 업데이트
  async updateNovation(updateAcademyDto: UpdateAcademyPaidCheckedDto, hashedUserId: string, rawInfo: RawLogInfoDto): Promise<{ updatedCount: number }>
  {
    const { checkedRows } = updateAcademyDto;
    const currentEndOfMonth = endOfMonth(new Date());
    const logCommonData = this.refineDto(hashedUserId, rawInfo);

    if (!checkedRows || !Array.isArray(checkedRows) || checkedRows.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '학원상태변경실패' }});
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
        .whereInIds(
          checkedRows.map((row) => ({ heahedAcademyId: row.data1 })),
        ) 
        .execute();
      const updatedAcademyCount = updateAcademyResult.affected || 0;

      const updateUserResult = await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ok: true})
        .whereInIds(
          checkedRows.map((row) => ({ hashedAcademyId: row.data1 }))
        )
        .execute();
      const updatedUserCount = updateUserResult.affected || 0;

      await queryRunner.commitTransaction();

      if(updatedAcademyCount > 0)
      {
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '학원상태변경성공' }});
      }

      if(updatedUserCount > 0)
      {
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원상태변경성공' }});
      }
      else
      {
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원상태변경실패' }});
      }
      
      return {updatedCount: updateAcademyResult.affected || 0};
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '학원상태변경실패' }});
      console.error('업데이트 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터 갱신중 오류가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  //신규 학원 등록(관리자 수기)
  async registNewAcademy(addNewAcademyDto: RegistAcademyCheckedDto, hashedUserId: string, rawInfo: RawLogInfoDto): Promise<{createdCount: number, academies: Academy[]}>
  {
    const { data } = addNewAcademyDto;
    const currentEndOfMonth = endOfMonth(new Date());
    const today = new Date();
    const logCommonData = this.refineDto(hashedUserId, rawInfo);

    if(!data || !Array.isArray(data) || data.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규학원등록실패' }});
      throw new NotFoundException('갱신할 데이터가 없습니다.');
    }
    for(const academyDto of data)
    {
      if(!academyDto['1'] || !academyDto['2'])
      {
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규학원등록실패' }});
        throw new BadRequestException('academyId 또는 academyName이 누락되었습니다.');
      }
    }

    //Transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const academies = addNewAcademyDto.data.map((academyDto) => {
        const encryptedAcademyId = hashSHA256(academyDto['1']);
        const encryptedAcademyName = encryptAES256GCM(academyDto['2']);

        const academy = new Academy();
          academy.hashedAcademyId = encryptedAcademyId;
          academy.encryptedAcademyName = Buffer.from(encryptedAcademyName.encryptedData, 'hex');
          academy.ivAcademyName = Buffer.from(encryptedAcademyName.iv, 'hex');
          academy.authTagAcademyName = Buffer.from(encryptedAcademyName.authTag, 'hex');
          academy.paymentStatus = true;
          academy.startMonth = today;
          academy.endMonth = currentEndOfMonth;

          return academy;
      });
      const createdAcademy = await queryRunner.manager.save(Academy, academies);
      await queryRunner.commitTransaction();

      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규학원등록성공' }});

      return {createdCount: createdAcademy.length || 0, academies: createdAcademy};
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규학원등록실패' }});
      console.error('업데이트 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터 갱신중 오류가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  //소속학원생숫자와 내 학원 정보 보내기
  async getAcademyStudent(userInfo: JWTPayloadDto)
  {
    const hashedAcademy = userInfo.hashedAcademyId;

    const rawMyAcademy = await this.academyRepository.findOne({where : {hashedAcademyId : hashedAcademy}});
    const myAcademy: decryptionAcademyDto = {
      hashedAcademyId: rawMyAcademy.hashedAcademyId,
      academyName: decryptionAES256GCM(rawMyAcademy.encryptedAcademyName, rawMyAcademy.ivAcademyName, rawMyAcademy.authTagAcademyName),
      paymentStatus: rawMyAcademy.paymentStatus,
      startMonth: rawMyAcademy.startMonth,
      endMonth: rawMyAcademy.endMonth,
    }
    
    const myAcademyStudent = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where('user.hashedAcademyId = :hashedAcademyId', { hashedAcademyId: hashedAcademy })
      .andWhere('user.userType = :userType', { userType: UserType.학생 })
      .getCount()
      
    return { myAcademy, myAcademyStudent };
  }
  //소속학원생리스트 구하기
  async getAcademyStudentList(userInfo: JWTPayloadDto)
  {
    const hashedAcademy = userInfo.hashedAcademyId;

    const rawMyAcademyStudent = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where('user.academy = :hashedAcademyId', { hashedAcademyId: hashedAcademy })
      .getMany();

    const myAcademyStudent: decryptionUserDto[] = rawMyAcademyStudent.map(item => ({
      hashedUserId: item.hashedUserId,
      rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
      rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
      hashedAcademyId: item.hashedAcademyId,
      userType: item.userType,
      ok: item.ok,
    }));
      
    return { myAcademyStudent };
  }
  //test
  /* async testCheckExpieredAcademies()
  {
    console.log('🔵 테스트 실행: 구독 만료 학원 처리');
    await this.checkExpiredAcademies();
    console.log('🟢 테스트 완료');
  } */
 /* async findOne(hashedAcademyId: string): Promise<Academy>
  {
    return await this.academyRepository.findOne({where : { hashedAcademyId }});
  } */
}