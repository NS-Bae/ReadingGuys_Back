import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class logDto {
  @IsString()
  data1: string; //heshedUserId
  @IsString()
  data2: string; //DeviceInfo
  @IsString()
  data3: string; //IPAdress
  @IsString()
  data4: string; //이벤트 종류
};

class rawLogInfoDto
{
  @IsString()
  deviceInfo: string;
  
  @IsString()
  IPA: string;
}

export class LogDto {
  @Type(() => logDto)
  log: logDto;
};

export class RawLogInfoDto {
  @Type(() => rawLogInfoDto)
  rawInfo: rawLogInfoDto;
};