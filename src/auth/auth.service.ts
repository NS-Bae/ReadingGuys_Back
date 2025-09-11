import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { LoginDto, UserInfoDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // 로거 생성

  constructor(
    private jwtService: JwtService, 
    private usersService: UsersService,
  ) {}
  //일반(전체)유저 로그인
  async validateUser(loginDto: LoginDto): Promise<any>
  {
    const { ip1: ip1, ip2: ip2 } = loginDto;
    const user = await this.usersService.findOne(ip1);
    
    if(!user)
    {
      throw new UnauthorizedException('I유저 정보가 올바르지 않습니다.');
    }
    
    const pw_result = await bcrypt.compare(ip2, user.password);

    if(!pw_result)
    {
      throw new UnauthorizedException('P유저정보가 올바르지 않습니다.');
    }
    if(!user.ok)
    {
      throw new UnauthorizedException('계정이 승인되지 않았습니다. 소속 학원으로 문의바랍니다.');
    }
    
    const { password, ...result } = user;
    return result;
  }
  //일반 로그인
  async login(loginDto: LoginDto): Promise<{ accessToken: string, userInfo: UserInfoDto }> 
  {
    const user = await this.validateUser(loginDto);

    const payload =
    { 
      hashedUserId: user.hashedUserId,
      hashedAcademyID: user.hashedAcademyID,
      userType: user.userType,
      isItOk: user.ok
    };
    const refinedUserInfo =
    {
      hashedUserId: user.hashedUserId,
      hashedAcademyID: user.hashedAcademyID,
      userType: user.userType,
      ok: user.ok,
    }

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, userInfo: refinedUserInfo };
  }
  //관리자인증
  async validateManager(loginDto: LoginDto): Promise<any>
  {
    const { ip1: ip1, ip2: ip2 } = loginDto;
    const user = await this.usersService.findOne(ip1);//유저찾기
    
    if(!user)
    {
      throw new UnauthorizedException('유저 정보가 올바르지 않습니다.');
    }
    
    const pw_result = await bcrypt.compare(ip2, user.password);

    if(!pw_result)
    {
      throw new UnauthorizedException('유저정보가 올바르지 않습니다.');
    }
    if(!user.ok)
    {
      throw new UnauthorizedException('계정이 승인되지 않았습니다. 소속 학원으로 문의바랍니다.');
    }
    if(user.userType !== '관리자' && user.userType !== '교사')
    {
      throw new UnauthorizedException('관리자용 로그인 페이지입니다. 일반 학생은 접근 할 수 없습니다.');
    }
    
    const { password, ...result } = user;
    return result;
  }
  //관리자 로그인
  async managerLogin(loginDto: LoginDto, res: Response)/* : Promise<{ accessToken: string }> */
  {
    const user = await this.validateManager(loginDto);

    const payload = { 
      hashedUserId: user.hashedUserId,
      hashedAcademyId: user.hashedAcademyId,
      userType: user.userType,
      isItOk: user.ok,
      iat: Math.floor(Date.now() / 1000) };
    
    const accessToken = this.jwtService.sign(payload);

    res.cookie('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      maxAge: 1800000,//30분
    })
    return res.json({ message: '로그인 성공', accessToken });
  }
  //로그아웃
  async logoutAll(res: Response)
  {
    res.clearCookie("access_token");
    res.status(200).json({messgae: '로그아웃 성공'});
  }
}
