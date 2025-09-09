import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DeleteAcademyCheckedRowDto {
  @IsString()
  data1: string; //heshedAcademyId
  @IsString()
  data2: string; //heshedUserId
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
  @Type(() => DeleteAcademyCheckedRowDto)
  checkedRows: DeleteAcademyCheckedRowDto[];
};