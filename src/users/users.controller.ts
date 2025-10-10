// src/users/users.controller.ts
import { Controller, Post, Get, Body, Delete } from '@nestjs/common';

import { UsersService } from './users.service';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';

import { AddNewUserDto, SearchUsersDto, UpdateUsersDto, DeleteUsersDto } from '../dto/user.dto';
import { RawLogInfoDto } from '../dto/log.dto';
import { decryptionUserDetailDto } from '../dto/return.dto';
import { Public } from 'src/auth/decorators/public.decorator';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/1')
  async findAll(): Promise<decryptionUserDetailDto[]> {
    return this.usersService.findAll();
  }
  /*
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    return this.usersService.update(id, userData);
  } */
  
  @Post('adddata')
  async regist(@CurrentUser('hashedUserId') hashedData: string, @Body() registUserDto: AddNewUserDto, rawInfo: RawLogInfoDto)
  {
    return this.usersService.registUsers(hashedData, registUserDto, rawInfo);
  }

  @Post('info')
  async search(@Body() searchUsersDto: SearchUsersDto)
  {
    return this.usersService.searchUsers(searchUsersDto);
  }

  @Post('changedata')
  async updateInfo(@CurrentUser() payload: any, @Body() updateUsersDto: UpdateUsersDto, rawInfo: RawLogInfoDto)
  {
    return this.usersService.updateUsers(payload.hashedUserId, updateUsersDto, rawInfo);
  }

  @Delete('deletedata')
  async deleteUsers(@CurrentUser() payload: any, @Body() deleteCheckedDto: DeleteUsersDto, rawInfo: RawLogInfoDto)
  {
    return this.usersService.deleteUsers(payload.hashedUserId, deleteCheckedDto, rawInfo);
  }
}
