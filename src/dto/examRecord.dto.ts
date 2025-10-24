import { Type } from "class-transformer";
import { IsBoolean, IsISO8601, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

class AnswerItemDto {
  @IsNumber()
  @IsNotEmpty()
  questionNumber: number;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;

  @IsString()
  @IsNotEmpty()
  userAnswer: string;

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}

export class ExamRecordDataDto
{
  @IsNumber()
  @IsNotEmpty()
  workbook: number;

  @IsNumber()
  @IsNotEmpty()
  correctCount: number;

  @IsISO8601()
  @IsNotEmpty()
  submitDate: string;

  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answer: AnswerItemDto[];
}

class refineDataDto
{
  @IsString()
  workbookId: string;
};

export class SearchDetailRecordDto
{
  @ValidateNested({ each: true })
  @Type(() => refineDataDto)
  refineData: refineDataDto;
}