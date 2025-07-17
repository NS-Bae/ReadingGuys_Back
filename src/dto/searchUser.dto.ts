import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CheckedRowDto {
  @IsString()
  data1: string;
  @IsString()
  data2: string;
};

export class SearchUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckedRowDto)
  checkedRow: CheckedRowDto[];
};