import { Controller, Post, Body, Logger, Res, UseGuards, Req } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';

import { LoginDto, UserInfoDto } from './dto/login.dto';
import { RawLogInfoDto } from '../dto/log.dto';

import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/currentUser.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
  //일반
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string, userInfo:UserInfoDto }> {
    return this.authService.login(loginDto);
  }
  //관리자
  @Public()
  @Post('manager_login')
  async managerLogin(@Body() loginDto: LoginDto, @Res() res: Response,)/* : Promise<{ accessToken: string, userInfo:string }> */ 
  {
    await this.authService.managerLogin(loginDto, res);
  }
  //로그아웃
  @Post('logout')
  async logout(@CurrentUser('hashedUserId') hashedData: string, @Res() res: Response, @Body() data: RawLogInfoDto)
  {
    await this.authService.logoutAll(res, hashedData, data);
  }
}