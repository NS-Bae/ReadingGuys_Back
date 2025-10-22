import { Controller, Post, Body, Logger, Res, Req } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';

import { LoginDto, UserInfoDto } from './dto/login.dto';
import { RawLogInfoDto } from '../dto/log.dto';

import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/currentUser.decorator';
import { DeviceInfo } from './decorators/deviceInfo.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
  //일반
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
    @DeviceInfo() { deviceInfo }
  ): Promise<{ accessToken: string, userInfo:UserInfoDto }>
  {
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: deviceInfo,
        IPA: req.clientIp,
      }
    };
    return this.authService.login(loginDto, rawInfo);
  }
  //관리자
  @Public()
  @Post('manager_login')
  async managerLogin(@Body() loginDto: LoginDto, @Req() req: any, @Res() res: Response,)/* : Promise<{ accessToken: string, userInfo:string }> */ 
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    await this.authService.managerLogin(loginDto, rawInfo, res);
  }
  //로그아웃
  @Post('manager_logout')
  async managerLogout(@CurrentUser('hashedUserId') hashedData: string, @Req() req: any, @Res() res: Response)
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    await this.authService.logoutManager(res, hashedData, rawInfo);
  }
}