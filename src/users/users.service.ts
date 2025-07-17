import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';

import { User } from './users.entity';
import { Academy } from '../academy/academy.entity';
import { AddNewUserDto } from '../dto/createUser.dto';
import { SearchUsersDto } from '../dto/searchUser.dto';
import { UpdateUsersDto } from '../dto/updateUser.dto';
import { DeleteCheckedDto } from 'src/dto/deleteChecked.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async registUser(registUserDto: AddNewUserDto): Promise<{addedCount: number}>
  { 
    const { data } = registUserDto;

    console.log(data, 'a', registUserDto);
    if (!data || !Array.isArray(data) || data.length === 0) {
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
          if (!userDto['1'] || !userDto['2'] || !userDto['3'] || !userDto.academies || !userDto.types) {
            throw new InternalServerErrorException('정보 입력이 누락 되었습니다.');
          }
            
          const academy = await queryRunner.manager.findOne(Academy, { where: { academyId: userDto.academies } });
      
          if (!academy) {
            throw new InternalServerErrorException('해당 academyId가 존재하지 않습니다.');
          }

          console.log(academy);
      
          const user = new User();
          user.id = userDto['1'];
          user.password = userDto['2'];
          user.userName = userDto['3'];
          user.academy = academy; // ✅ academy 객체를 직접 할당
          user.userType = userDto.types;
          user.ok = true;
      
          console.log(user);
          return user;
        })
      );
      const registUser = await queryRunner.manager.save(User, newUser);

      await queryRunner.commitTransaction();

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

  async searchUsers(searchUsersDto: SearchUsersDto)
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

  async updateUsers(updateUsersDto: UpdateUsersDto): Promise<{updatedCount: number}>
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

  async deleteUsers(deleteCheckedDto: DeleteCheckedDto): Promise<{deletedCount: number}>
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
    this.logger.debug('Fetched users:', users);
    return users;
  }

  async findOne(id: string): Promise<User> 
  {
    const user = await this.usersRepository.findOne({ where : { id } })
    return user;
  }

  async findAcademy(id: string)
  {
    const userAcademyId = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.academy', 'academy')
      .select([
        "academy.academyId as academyId",
      ])
      .where('user.id = :id', { id: id })
      .getRawOne();

    return userAcademyId;
  }

  async update(id: string, userData: Partial<User>): Promise<User>
  {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void>
  {
    await this.usersRepository.delete(id);
  }
}