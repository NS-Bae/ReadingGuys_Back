import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NewAcademyDto 
{
  @IsString()
  data1: string;
  @IsString()
  data2: string;
};

export class AddNewAcademyDto
{
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewAcademyDto)
  data: NewAcademyDto[];
}