import { IsBoolean, IsDate, IsEnum, IsString } from "class-validator";
import { Transform } from "class-transformer";
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