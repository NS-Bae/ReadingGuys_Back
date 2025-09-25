import { Controller, Post, Get, Param, Body, Put, Delete, Logger, Patch } from '@nestjs/common';
import { AcademyService } from './academy.service';

import { DeleteAcademyCheckedDto, RegistAcademyCheckedDto, UpdateAcademyPaidCheckedDto } from '../dto/multiChecked.dto';
import { RawLogInfoDto } from '../dto/log.dto';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';

@Controller('academy')
export class AcademyController{
  constructor(
    private readonly academyService : AcademyService,
  ) {}

  @Get('totallist')
  async getAcademyList()
  {
    const academies = await this.academyService.findAll();
    return academies;
  };

  @Delete('deletedata')
  async deleteAcademy(@CurrentUser('hashedUserId') hashedUserId: string, @Body() deleteCheckedDto: DeleteAcademyCheckedDto, rawInfo: RawLogInfoDto)
  {
    return this.academyService.deleteData(deleteCheckedDto, hashedUserId, rawInfo);
  };

  @Patch('novation')
  async updateAcademyNovation(@CurrentUser('hashedUserId') hashedUserId: string, @Body()updateAcademyDto: UpdateAcademyPaidCheckedDto, rawInfo: RawLogInfoDto)
  {
    return this.academyService.updateNovation(updateAcademyDto, hashedUserId, rawInfo);
  }

  @Post('adddata')
  async registNewAcademy(@CurrentUser('hashedUserId') hashedUserId: string, @Body() addNewAcademyDto: RegistAcademyCheckedDto, rawInfo: RawLogInfoDto)
  {
    return this.academyService.registNewAcademy(addNewAcademyDto, hashedUserId, rawInfo);
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