import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto
{
  @IsString()
  @IsNotEmpty()
  ip1: string;
  
  @IsString()
  @IsNotEmpty()
  ip2: string;
}

export class UserInfoDto
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
