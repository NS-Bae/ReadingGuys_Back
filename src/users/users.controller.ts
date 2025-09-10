// src/users/users.controller.ts
import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { AddNewUserDto } from '../dto/createUser.dto';
import { SearchUsersDto } from '../dto/searchUser.dto';
import { UpdateUsersDto } from '../dto/updateUser.dto';
import { DeleteCheckedDto } from '../dto/multiChecked.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    return this.usersService.update(id, userData);
  }

  @Post('adddata')
  async regist(@Body() registUserDto: AddNewUserDto)
  {
    return this.usersService.registUser(registUserDto);
  }

  @Post('info')
  async search(@Body() searchUsersDto: SearchUsersDto)
  {
    return this.usersService.searchUsers(searchUsersDto);
  }

  @Post('changedata')
  async updateInfo(@Body() updateUsersDto: UpdateUsersDto)
  {
    return this.usersService.updateUsers(updateUsersDto);
  }

  @Delete('deletedata')
  async deleteUsers(@Body() deleteCheckedDto: DeleteCheckedDto)
  {
    return this.usersService.deleteUsers(deleteCheckedDto);
  }
}
