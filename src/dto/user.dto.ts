import { IsArray, IsEnum, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserType } from '../others/other.types';

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
};

class CheckedUserDto {
  @IsString()
  data1: string;

  @IsString()
  data2: string;
};

class UpdateUserDto
{
  @IsString()
  id: string;

  @IsOptional()
  @IsEnum(UserType)
  types?: UserType;
  
  @IsOptional()
  @IsString()
  pw?: string;
}

export class AddNewUserDto
{
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewUserDto)
  data: NewUserDto[];
};

export class SearchUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckedUserDto)
  checkedRow: CheckedUserDto[];
};

export class UpdateUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserDto)
  data: UpdateUserDto[];
};