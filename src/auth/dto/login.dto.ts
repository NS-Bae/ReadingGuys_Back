import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

class loginDto
{
  @IsString()
  @IsNotEmpty()
  ip1: string;  //평문아이디
  
  @IsString()
  @IsNotEmpty()
  ip2: string;  //평문 비번

  @IsString()
  @IsNotEmpty()
  data1: Buffer;

  @IsString()
  @IsNotEmpty()
  data2: Buffer;

  @IsString()
  @IsNotEmpty()
  data3: Buffer;

  @IsString()
  @IsNotEmpty()
  data4: Buffer;

  @IsString()
  @IsNotEmpty()
  data5: Buffer;

  @IsString()
  @IsNotEmpty()
  data6: Buffer;
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

class logDto
{
  @IsString()
  @IsNotEmpty()
  data1: Buffer;

  @IsString()
  @IsNotEmpty()
  data2: Buffer;

  @IsString()
  @IsNotEmpty()
  data3: Buffer;

  @IsString()
  @IsNotEmpty()
  data4: Buffer;

  @IsString()
  @IsNotEmpty()
  data5: Buffer;

  @IsString()
  @IsNotEmpty()
  data6: Buffer;
}

export class LoginDto
{
  @Type(() => loginDto)
  info: loginDto;
}

export class UserInfoDto
{
  @Type(() => userInfoDto)
  info: userInfoDto;
}

export class LogDto
{
  @Type(() => logDto)
  info: logDto;
}