import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DataDto {
  @IsString()
  data1: string;
  @IsString()
  data2: string;
};

export class UpdateBookPaidDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataDto)
  data: DataDto[];
};