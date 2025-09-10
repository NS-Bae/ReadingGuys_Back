import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class logDto {
  @IsString()
  data1: string; //heshedUserId
  @IsString()
  data2: Buffer; //encryptedDeviceInfo
  @IsString()
  data3: Buffer; //ivDeviceInfo
  @IsString()
  data4: Buffer; //authTagDeviceInfo
  @IsString()
  data5: Buffer; //encryptedIPAdress
  @IsString()
  data6: Buffer; //ivIPAdress
  @IsString()
  data7: Buffer; //authTagIPAdress
  @IsString()
  data8: string; //이벤트 종류
};

export class LogDto {
  @Type(() => logDto)
  log: logDto;
};