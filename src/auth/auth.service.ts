import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { LogDto, LoginDto, UserInfoDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { EventLogsService } from '../eventlogs/eventlogs.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // 로거 생성
  constructor(
    private jwtService: JwtService, 
    private usersService: UsersService,
    private readonly eventLogsService: EventLogsService,
  ) {}

  refineDto(row: any, data: string)
  {
    return {
      data1: data,
      data2: row.data1,
      data3: row.data2,
      data4: row.data3,
      data5: row.data4,
      data6: row.data5,
      data7: row.data6,
    };
  }
  //일반(전체)유저 로그인
  async validateUser(loginDto: LoginDto): Promise<any>
  {
    const { info } = loginDto;
    const hashedData = info.ip1;

    const user = await this.usersService.findOne(hashedData);
    const logCommonData = this.refineDto(info, hashedData);
    
    if(!user)
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '로그인실패'}
      });
      throw new UnauthorizedException('I유저 정보가 올바르지 않습니다.');
    }
    
    const pw_result = await bcrypt.compare(info.ip2, user.password);

    if(!pw_result)
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '로그인실패'}
      });
      throw new UnauthorizedException('P유저정보가 올바르지 않습니다.');
    }
    if(!user.ok)
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '로그인실패'}
      });
      throw new UnauthorizedException('계정이 승인되지 않았습니다. 소속 학원으로 문의바랍니다.');
    }
    
    const { password, ...result } = user;
    return result;
  }
  //일반 로그인
  async login(loginDto: LoginDto): Promise<{ accessToken: string, userInfo: UserInfoDto }> 
  {
    const user = await this.validateUser(loginDto);
    const { info } = loginDto;

    const payload =
    { 
      hashedUserId: user.hashedUserId,
      hashedAcademyID: user.hashedAcademyID,
      userType: user.userType,
      isItOk: user.ok
    };
    const refinedUserInfo: UserInfoDto =
    {
      info: {
        hashedUserId: user.hashedUserId,
        hashedAcademyID: user.hashedAcademyID,
        userType: user.userType,
        ok: user.ok,
      }
    };

    const accessToken = this.jwtService.sign(payload);
    const logCommonData = this.refineDto(info, user.hashedUserId);

    await this.eventLogsService.createBusinessLog({
      log: { ...logCommonData, data8: '로그인'}
    });

    return { accessToken, userInfo: refinedUserInfo };
  }
  //관리자인증
  async validateManager(loginDto: LoginDto): Promise<any>
  {
    const { info } = loginDto;
    const hashedData = info.ip1;

    const user = await this.usersService.findOne(hashedData);
    const logCommonData = this.refineDto(info, hashedData);
    
    if(!user)
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '로그인실패'}
      });
      throw new UnauthorizedException('유저 정보가 올바르지 않습니다.');
    }
    
    const pw_result = await bcrypt.compare(info.ip2, user.password);

    if(!pw_result)
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '로그인실패'}
      });
      throw new UnauthorizedException('유저정보가 올바르지 않습니다.');
    }
    if(!user.ok)
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '로그인실패'}
      });
      throw new UnauthorizedException('계정이 승인되지 않았습니다. 소속 학원으로 문의바랍니다.');
    }
    if(user.userType !== '관리자' && user.userType !== '교사')
    {
      await this.eventLogsService.createBusinessLog({
        log: { ...logCommonData, data8: '관리자인증실패'}
      });
      throw new UnauthorizedException('관리자용 로그인 페이지입니다. 일반 학생은 접근 할 수 없습니다.');
    }
    await this.eventLogsService.createBusinessLog({
      log: { ...logCommonData, data8: '관리자인증성공'}
    });
    
    const { password, ...result } = user;
    return result;
  }
  //관리자 로그인
  async managerLogin(loginDto: LoginDto, res: Response)/* : Promise<{ accessToken: string }> */
  {
    const user = await this.validateManager(loginDto);
    const { info } = loginDto;

    const payload = { 
      hashedUserId: user.hashedUserId,
      hashedAcademyId: user.hashedAcademyId,
      userType: user.userType,
      isItOk: user.ok,
      iat: Math.floor(Date.now() / 1000) };
    
    const accessToken = this.jwtService.sign(payload);
    const logCommonData = this.refineDto(info, user.hashedUserId);

    await this.eventLogsService.createBusinessLog({
      log: { ...logCommonData, data8: '로그인'}
    });

    res.cookie('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      maxAge: 1800000,//30분
    })
    return res.json({ message: '로그인 성공', accessToken });
  }
  //로그아웃
  async logoutAll(res: Response, hashedData: string, data: LogDto)
  {
    const info = { data };
    const logCommonData = this.refineDto(info, hashedData);

    await this.eventLogsService.createBusinessLog({
      log: { ...logCommonData, data8: '로그아웃'}
    });
    res.clearCookie("access_token");
    res.status(200).json({messgae: '로그아웃 성공'});
  }
}
