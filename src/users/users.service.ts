import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';

import { User } from './users.entity';
import { Academy } from '../academy/academy.entity';

import { AddNewUserDto, SearchUsersDto, UpdateUsersDto, DeleteUsersDto } from '../dto/user.dto';
import { RawLogInfoDto } from '../dto/log.dto';
import { decryptionUserDetailDto } from '../dto/return.dto';

import { EventLogsService } from "../eventlogs/eventlogs.service";
import { decryptionAES256GCM, encryptAES256GCM, hashSHA256 } from "../utill/encryption.service";

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

  async findOne(hashedUserId: string): Promise<User> 
  {
    try
    {
      const user = await this.usersRepository.findOne({
        select : ['hashedUserId', 'password', 'hashedAcademyId', 'userType', 'ok'],
        where : { hashedUserId }
      })
      return user;
    }
    catch(error)
    {
      throw new InternalServerErrorException('조회중 오류가 발생했습니다.');
    }
  }

  //관리자 직접 등록용
  async registUsers(hashedData: string, registUserDto: AddNewUserDto, rawInfo: RawLogInfoDto): Promise<{addedCount: number}>
  { 
    const { data } = registUserDto;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;

    const logCommonData = this.refineDto(hashedData, device, ia);

    if(!data || !Array.isArray(data) || data.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규사용자등록실패' }});
      throw new NotFoundException('등록할 데이터가 없습니다.');
    }

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
            await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규사용자등록실패' }});
            throw new InternalServerErrorException('정보 입력이 누락 되었습니다.');
          }
          const hashId = hashSHA256(userDto['1']);
          const encryptUserId = encryptAES256GCM(userDto['1']);
          const encryptUserName = encryptAES256GCM(userDto['3']);
            
          const academy = await queryRunner.manager.findOne(Academy, { where: { hashedAcademyId: userDto.academies } });
      
          if(!academy)
          {
            await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규사용자등록실패' }});
            throw new InternalServerErrorException('해당 academyId가 존재하지 않습니다.');
          }
      
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

      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규사용자등록성공' }});

      return { addedCount: registUser.length || 0 };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();

      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '신규사용자등록실패' }});
      console.error('업데이트 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터 갱신중 오류가 발생했습니다.'); 
    }
    finally
    {
      await queryRunner.release();
    }
  }

  async searchUsers(searchUsersDto: SearchUsersDto)
  {
    const{ checkedRow } = searchUsersDto;

    const hashedUserIds = checkedRow.map(row => row.data2);
    const hashedAcademyIds = checkedRow.map(row => row.data1);

    try
    {
      const rawUsers = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.academy', 'academy')
        .select([
          'user.hashedUserId',
          'user.hashedAcademyId',
          'user.encryptedUserId',
          'user.ivUserId',
          'user.authTagUserId',
          'user.encryptedUserName',
          'user.ivUserName',
          'user.authTagUserName',
          'user.userType',
          'user.ok',
          'academy.encryptedAcademyName',
          'academy.ivAcademyName',
          'academy.authTagAcademyName',
        ])
        .where('user.hashedUserId IN (:...hashedUserIds)', { hashedUserIds })
        .andWhere('user.hashedAcademyId IN (:...hashedAcademyIds)', { hashedAcademyIds })
        .getMany();

      const refineUsers: decryptionUserDetailDto[] = rawUsers.map(item => ({
        hashedUserId: item.hashedUserId,
        rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
        rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
        hashedAcademyId: item.hashedAcademyId,
        rawAcademyName: decryptionAES256GCM(item.academy.encryptedAcademyName, item.academy.ivAcademyName, item.academy.authTagAcademyName),
        userType: item.userType,
        ok: item.ok,
      }))

      return refineUsers;
    }
    catch(error)
    {
      throw new InternalServerErrorException('조회중에 오류가 발생했습니다.')
    }
  }

  async updateUsers(hashedData: string, updateUsersDto: UpdateUsersDto, rawInfo: RawLogInfoDto): Promise<{updatedCount: number}>
  {
    const { data } = updateUsersDto;
    let updatedCount = 0;

    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;

    const logCommonData = this.refineDto(hashedData, device, ia);

    if(data.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원상태변경실패' }});
      throw new NotFoundException('삭제할 데이터가 없습니다.');
    }
    
    for (const userData of data) 
    {
      const user = await this.usersRepository.findOne({ where: { hashedUserId: userData.id}});

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
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원상태변경성공' }});
        updatedCount++;
      }
      else
      {
        console.log(`User with id ${userData.id} not found`);
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원상태변경실패' }});
      }
    }
    return { updatedCount }
  }

  async deleteUsers(hashedData: string, deleteCheckedDto: DeleteUsersDto, rawInfo: RawLogInfoDto): Promise<{deletedCount: number}>
  {
    const { checkedRow } = deleteCheckedDto;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;

    const hashedUserIds = checkedRow.map(row => row.data2);
    const hashedAcademyIds = checkedRow.map(row => row.data1);

    const logCommonData = this.refineDto(hashedData, device, ia);

    if(checkedRow.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원삭제실패' }});
      throw new NotFoundException('삭제할 데이터가 없습니다.');
    }

    //Transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('hashedUserId IN (:...hashedUserIds)', { hashedUserIds })
        .andWhere('hashedAcademyId IN (:...hashedAcademyIds)', { hashedAcademyIds })
        .execute();

      await queryRunner.commitTransaction();
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원삭제성공' }});
      
      return { deletedCount: result.affected ?? 0 };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '회원삭제실패' }});

      throw new InternalServerErrorException('사용자 삭제중 문제가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<decryptionUserDetailDto[]> 
  {
    try
    {
      const rawUsers = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.academy', 'academy')
        .select([
          'user.hashedUserId',
          'user.hashedAcademyId',
          'user.encryptedUserId',
          'user.ivUserId',
          'user.authTagUserId',
          'user.encryptedUserName',
          'user.ivUserName',
          'user.authTagUserName',
          'user.userType',
          'user.ok',
          'academy.encryptedAcademyName',
          'academy.ivAcademyName',
          'academy.authTagAcademyName',
        ])
        .getMany();

      const refineUsers: decryptionUserDetailDto[] = rawUsers.map(item => ({
        hashedUserId: item.hashedUserId,
        rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
        rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
        hashedAcademyId: item.hashedAcademyId,
        rawAcademyName: decryptionAES256GCM(item.academy.encryptedAcademyName, item.academy.ivAcademyName, item.academy.authTagAcademyName),
        userType: item.userType,
        ok: item.ok,
      }))

      return refineUsers;
    }
    catch(error)
    {
      throw new InternalServerErrorException('조회 중 오류가 발생했습니다.');
    }
  }

  /*
  async update(id: string, userData: Partial<User>): Promise<User>
  {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  } 

  async remove(hashedUserId: string): Promise<void>
  {
    await this.usersRepository.delete(hashedUserId);
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
  */
}