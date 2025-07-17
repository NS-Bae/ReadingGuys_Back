import { Controller, Post, Get, Param, Body, Put, Delete, Logger, Patch } from '@nestjs/common';
import { AcademyService } from './academy.service';

import { DeleteCheckedDto } from '../dto/deleteChecked.dto';
import { UpdateAcademyDto } from '../dto/update-academy.dto';
import { AddNewAcademyDto } from '../dto/create-academy.dto';

@Controller('academy')
export class AcademyController{
  constructor(
    private readonly academyService : AcademyService,
  ) {}

  @Get('totallist')
  async getAcademyList()
  {
    const workbooks = await this.academyService.findAll();
    return workbooks;
  };

  @Delete('deletedata')
  async deleteAcademy(@Body()deleteCheckedDto: DeleteCheckedDto)
  {
    return this.academyService.deleteData(deleteCheckedDto);
  };

  @Patch('novation')
  async updateAcademyNovation(@Body()updateAcademyDto: UpdateAcademyDto)
  {
    return this.academyService.updateNovation(updateAcademyDto);
  }

  @Post('adddata')
  async registNewAcademy(@Body() addNewAcademyDto: AddNewAcademyDto)
  {
    return this.academyService.registNewAcademy(addNewAcademyDto);
  }

  @Post('myinfo')
  async getAcademyInfo(@Body("userInfo") userInfo: string)
  {
    return this.academyService.getAcademyStudent(userInfo);
  }

  @Post('academystudentlist')
  async getAcademyStudentInfo(@Body("userInfo") userInfo: string)
  {
    return this.academyService.getAcademyStudentList(userInfo);
  }
  //test
  /* @Post('test-expired')
  async testExpiredAcademies()
  {
    await this.academyService.testCheckExpieredAcademies();
    return { message: '✅ 구독 만료 학원 확인 실행 완료' };
  } */
}