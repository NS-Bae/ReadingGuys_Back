// src/users/users.controller.ts
import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './users.entity';

import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';

import { AddNewUserDto, SearchUsersDto, UpdateUsersDto, DeleteUsersDto } from '../dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/1')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  /* @Put(':id')
  update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    return this.usersService.update(id, userData);
  } */

  @Post('adddata')
  async regist(@CurrentUser() payload: any, @Body() registUserDto: AddNewUserDto)
  {
    return this.usersService.registUsers(payload.hashedUserId, registUserDto);
  }

  @Post('info')
  async search(@CurrentUser() payload: any, @Body() searchUsersDto: SearchUsersDto)
  {
    return this.usersService.searchUsers(payload.hashedUserId, searchUsersDto);
  }

  @Post('changedata')
  async updateInfo(@CurrentUser() payload: any, @Body() updateUsersDto: UpdateUsersDto)
  {
    return this.usersService.updateUsers(payload.hashedUserId, updateUsersDto);
  }

  @Delete('deletedata')
  async deleteUsers(@CurrentUser() payload: any, @Body() deleteCheckedDto: DeleteUsersDto)
  {
    return this.usersService.deleteUsers(payload.hashedUserId, deleteCheckedDto);
  }
}
