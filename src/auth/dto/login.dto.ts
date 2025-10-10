import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto
{
  @IsString()
  @IsNotEmpty()
  ip1: string;  //평문아이디
  
  @IsString()
  @IsNotEmpty()
  ip2: string;  //평문 비번

  @IsString()
  @IsNotEmpty()
  userAgent: string;  //기기 정보
}

class userInfoDto
{
  @IsString()
  @IsNotEmpty()
  hashedUserId: string;
  
  @IsString()
  @IsNotEmpty()
  hashedAcademyID: string;

  @IsString()
  @IsNotEmpty()
  userType: string;

  @IsString()
  @IsNotEmpty()
  ok: string;
}

/* export class LoginDto
{
  @Type(() => loginDto)
  info: loginDto;
} */

export class UserInfoDto
{
  @Type(() => userInfoDto)
  info: userInfoDto;
}