import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AcademyRowDto {
  @IsString()
  data1: string; //heshedAcademyId or 학원ID
  @IsString()
  data2: string; //heshedUserId    or 학원이름
};

export class DeleteAcademyCheckedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcademyRowDto)
  checkedRows: AcademyRowDto[];
};
export class UpdateAcademyPaidCheckedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcademyRowDto)
  checkedRows: AcademyRowDto[];
};
export class RegistAcademyCheckedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcademyRowDto)
  data: AcademyRowDto[];
};