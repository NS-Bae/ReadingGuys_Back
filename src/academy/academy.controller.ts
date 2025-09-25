import { Controller, Post, Get, Param, Body, Put, Delete, Logger, Patch } from '@nestjs/common';
import { AcademyService } from './academy.service';

import { DeleteAcademyCheckedDto, RegistAcademyCheckedDto, UpdateAcademyPaidCheckedDto } from '../dto/multiChecked.dto';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';

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
  async deleteAcademy(@Body()deleteCheckedDto: DeleteAcademyCheckedDto)
  {
    return this.academyService.deleteData(deleteCheckedDto);
  };

  @Patch('novation')
  async updateAcademyNovation(@Body()updateAcademyDto: UpdateAcademyPaidCheckedDto)
  {
    return this.academyService.updateNovation(updateAcademyDto);
  }

  @Post('adddata')
  async registNewAcademy(@Body() addNewAcademyDto: RegistAcademyCheckedDto)
  {
    return this.academyService.registNewAcademy(addNewAcademyDto);
  }

  @Post('myinfo')
  async getAcademyInfo(@CurrentUser() payload: any)
  {
    return this.academyService.getAcademyStudent(payload);
  }

  @Post('academystudentlist')
  async getAcademyStudentInfo(@CurrentUser() payload: any)
  {
    return this.academyService.getAcademyStudentList(payload);
  }
  //test
  /* @Post('test-expired')
  async testExpiredAcademies()
  {
    await this.academyService.testCheckExpieredAcademies();
    return { message: '✅ 구독 만료 학원 확인 실행 완료' };
  } */
}