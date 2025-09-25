import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';

import { User } from './users.entity';
import { Academy } from '../academy/academy.entity';

import { AddNewUserDto, SearchUsersDto, UpdateUsersDto, DeleteUsersDto } from '../dto/user.dto';
import { EventLogsService } from "../eventlogs/eventlogs.service";
import { encryptAES256GCM, hashSHA256 } from "src/utill/encryption.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly eventLogsService: EventLogsService,
    private dataSource: DataSource,
  ) {}

  refineDto(data1: string, data2: string, data3: string)
  {
    return {
      data1: data1,
      data2: data2,
      data3: data3,
    };
  }

  //관리자 직접 등록용
  async registUsers(hashedData: string, registUserDto: AddNewUserDto): Promise<{addedCount: number}>
  { 
    const { data } = registUserDto;

    if(!data || !Array.isArray(data) || data.length === 0)
    {
      throw new NotFoundException('등록할 데이터가 없습니다.');
    }

    const device = data[0].info1;
    const ia = data[0].info2;

    const logCommonData = this.refineDto(hashedData, device, ia);

    //Transaction 시작
    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); 

    try
    {
      const newUser = await Promise.all(
        registUserDto.data.map(async (userDto) => {
          if(!userDto['1'] || !userDto['2'] || !userDto['3'] || !userDto.academies || !userDto.types)
          {
            throw new InternalServerErrorException('정보 입력이 누락 되었습니다.');
          }
          const hashId = hashSHA256(userDto['1']);
          const encryptUserId = encryptAES256GCM(userDto['1']);
          const encryptUserName = encryptAES256GCM(userDto['3']);
            
          const academy = await queryRunner.manager.findOne(Academy, { where: { hashedAcademyId: userDto.academies } });
      
          if (!academy) {
            throw new InternalServerErrorException('해당 academyId가 존재하지 않습니다.');
          }

          console.log(academy);
      
          const user = new User();
          user.hashedUserId = hashId;
          user.encryptedUserId = Buffer.from(encryptUserId.encryptedData, 'hex');
          user.ivUserId = Buffer.from(encryptUserId.iv, 'hex');
          user.authTagUserId = Buffer.from(encryptUserId.authTag, 'hex');
          user.password = userDto['2'];
          user.encryptedUserName = Buffer.from(encryptUserName.encryptedData, 'hex');
          user.ivUserName = Buffer.from(encryptUserName.iv, 'hex');
          user.authTagUserName = Buffer.from(encryptUserName.authTag, 'hex');
          user.academy = academy; // ✅ academy 객체를 직접 할당
          user.userType = userDto.types;
          user.ok = true;
      
          console.log(user);
          return user;
        })
      );
      const registUser = await queryRunner.manager.save(User, newUser);

      await queryRunner.commitTransaction();

      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규학원등록성공' }});

      return { addedCount: registUser.length || 0 };
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

  async searchUsers(hashedData: string, searchUsersDto: SearchUsersDto)
  {
    const{ checkedRow } = searchUsersDto;

    const userIds = checkedRow.map(row => row.data2);
    const academyIds = checkedRow.map(row => row.data1);

    const users = await this.usersRepository.find({
      where: {
        id: In(userIds),
        academy: {
          academyId: In(academyIds),
        },
      },
      relations: ['academy'],
      select: ['id', 'userName', 'academy', 'userType', 'ok'],
    });

    return users;
  }

  async updateUsers(hashedData: string, updateUsersDto: UpdateUsersDto): Promise<{updatedCount: number}>
  {
    const { data } = updateUsersDto;
    let updatedCount = 0;
    
    for (const userData of data) 
    {
      const user = await this.usersRepository.findOne({ where: { id: userData.id}});

      if(user)
      {
        if(userData.types)
        {
          user.userType = userData.types;
        }
        if(userData.pw)
        {
          user.password = userData.pw;
        }

        await this.usersRepository.save(user);
        updatedCount++;
      }
      else
      {
        console.log(`User with id ${userData.id} not found`);
      }
    }
    return { updatedCount }
  }

  async deleteUsers(hashedData: string, deleteCheckedDto: DeleteUsersDto): Promise<{deletedCount: number}>
  {
    const { checkedRows } = deleteCheckedDto;

    if(checkedRows.length === 0)
    {
      throw new NotFoundException('삭제할 데이터가 없습니다.');
    }

    //Transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('id IN (:...usersIds)', {
          usersIds: checkedRows.map((item) => item.data2),
        })
        .execute();

      await queryRunner.commitTransaction();

      return { deletedCount: checkedRows.length };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException('사용자 삭제중 문제가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }

  findAll(): Promise<User[]> 
  {
    const users = this.usersRepository.find({ relations: ['academy'] });
    return users;
  }

  async findOne(hashedUserId: string): Promise<User> 
  {
    const user = await this.usersRepository.findOne({
      select : ['hashedUserId', 'password', 'hashedAcademyId', 'userType', 'ok'],
      where : { hashedUserId }
    })
    return user;
  }

  async findAcademy(id: string)
  {
    const userAcademyId = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.academy', 'academy')
      .select([
        "academy.hashedAcademyId",
      ])
      .where('user.hashedUserId = :id', { id: id })
      .getRawOne();

    return userAcademyId;
  }

  /* async update(id: string, userData: Partial<User>): Promise<User>
  {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  } */
/* 
  async remove(hashedUserId: string): Promise<void>
  {
    await this.usersRepository.delete(hashedUserId);
  } */
}