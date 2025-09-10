import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NewAcademyDto 
{
  @IsString()
  data1: string; //학원 id
  @IsString()
  data2: string; //학원 이름
};

export class AddNewAcademyDto
{
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewAcademyDto)
  data: NewAcademyDto[];
}