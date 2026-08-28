import { stringList } from "aws-sdk/clients/datapipeline";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { TermsStatus, TermsTypes } from "src/others/other.types";

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

export class TermDataParamsDto
{
  id: number;
  termsType: TermsTypes;
  title: string;
  Version: string;
  effectiveDate: Date;
  status: TermsStatus;
  createdBy: string;
  createdAt: Date;
  content: string;
}