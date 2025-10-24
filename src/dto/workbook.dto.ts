import { IsArray, IsBoolean, IsDate, IsEnum, IsString, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";
import { Difficulty } from '../others/other.types';
import { Multer } from "multer";

export class UploadBookDto
{
  @IsDate()
  @Transform(({value}) => new Date(value))
  releaseMonth: Date;

  @IsString()
  workbookName: string;

  @IsEnum(Difficulty)
  Difficulty: Difficulty;

  @IsBoolean()
  isPaid: boolean;

  file: Multer.File;
}

export class DownLoadBookDto
{
  @IsString()
  workbookId: string;

  @IsString()
  workbookName: string;

  @IsEnum(Difficulty)
  Difficulty: Difficulty;
}

class DataDto {
  @IsString()
  data1: number;
  @IsString()
  data2: string;
};

export class UpdateBookPaidDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataDto)
  data: DataDto[];
};