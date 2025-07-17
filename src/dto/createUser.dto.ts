import { IsArray, IsEnum, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserType } from '../users/users.entity';

class NewUserDto
{
  @IsString()
  @MinLength(4)
  data1: string;
  @IsString()
  @MinLength(6)
  data2: string;
  @IsString()
  data3: string;
  @IsString()
  academies: string;
  @IsEnum(UserType)
  types: UserType;
}

export class AddNewUserDto
{
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewUserDto)
  data: NewUserDto[];
}