import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AcademyRowDto {
  @IsString()
  data1: string; //heshedAcademyId 학원ID
  @IsString()
  data2: string; //heshedUserId    학원이름
  @IsString()
  data3: Buffer; //encryptedDeviceInfo
  @IsString()
  data4: Buffer; //ivDeviceInfo
  @IsString()
  data5: Buffer; //authTagDeviceInfo
  @IsString()
  data6: Buffer; //encryptedIPAdress
  @IsString()
  data7: Buffer; //ivIPAdress
  @IsString()
  data8: Buffer; //authTagIPAdress
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