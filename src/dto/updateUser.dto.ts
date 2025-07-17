import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserType } from "../users/users.entity";

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

export class UpdateUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserDto)
  data: UpdateUserDto[];
}