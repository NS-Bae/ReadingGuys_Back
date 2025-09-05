import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

class ReadFileParams
{
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  aid: string;

  @IsNotEmpty()
  @IsString()
  recordLink: string;
}

export class ReadFileParamsDto
{
  @ValidateNested({ each : true })
  @Type(() => ReadFileParams)
  readFileParams: ReadFileParams;
}