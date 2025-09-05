import { Controller, Post, Body, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, UserInfoDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
  //일반
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string, userInfo:UserInfoDto }> {
    return this.authService.login(loginDto);
  }
  //관리자
  @Post('manager_login')
  async managerLogin(@Body() loginDto: LoginDto, @Res() res: Response,)/* : Promise<{ accessToken: string, userInfo:string }> */ 
  {
    await this.authService.managerLogin(loginDto, res);
  }
  //로그아웃
  @Post('logout')
  async logout( @Res() res: Response)
  {
    await this.authService.logoutAll(res);
  }
}