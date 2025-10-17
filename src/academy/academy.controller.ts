import { Controller, Post, Get, Param, Body, Put, Delete, Logger, Patch, Req } from '@nestjs/common';
import { AcademyService } from './academy.service';

import { DeleteAcademyCheckedDto, RegistAcademyCheckedDto, UpdateAcademyPaidCheckedDto } from '../dto/multiChecked.dto';
import { RawLogInfoDto } from '../dto/log.dto';
import { JWTPayloadDto } from '../dto/other.dto';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('academy')
export class AcademyController{
  constructor(
    private readonly academyService : AcademyService,
  ) {}
  @Public()
  @Get('totallist')
  async getAcademyList()
  {
    const academies = await this.academyService.findAll();
    return academies;
  };

  @Delete('deletedata')
  async deleteAcademy(@CurrentUser('hashedUserId') hashedUserId: string, @Req() req: any, @Body() deleteCheckedDto: DeleteAcademyCheckedDto)
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.academyService.deleteData(deleteCheckedDto, hashedUserId, rawInfo);
  };

  @Patch('novation')
  async updateAcademyNovation(@CurrentUser('hashedUserId') hashedUserId: string, @Req() req: any, @Body()updateAcademyDto: UpdateAcademyPaidCheckedDto)
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.academyService.updateNovation(updateAcademyDto, hashedUserId, rawInfo);
  }
  
  @Post('adddata')
  async registNewAcademy(@CurrentUser('hashedUserId') hashedUserId: string, @Req() req: any, @Body() addNewAcademyDto: RegistAcademyCheckedDto)
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.academyService.registNewAcademy(addNewAcademyDto, hashedUserId, rawInfo);
  }

  @Get('myinfo')
  async getAcademyInfo(@CurrentUser() payload: JWTPayloadDto)
  {
    return this.academyService.getAcademyInfo(payload);
  }

  @Post('academystudentlist')
  async getAcademyStudentInfo(@CurrentUser() payload: JWTPayloadDto)
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