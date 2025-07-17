import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CheckedRowDto {
  @IsString()
  data1: string;
  @IsString()
  data2: string;
};

export class UpdateAcademyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckedRowDto)
  checkedRows: CheckedRowDto[];
};