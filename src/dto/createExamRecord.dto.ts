import { Type } from "class-transformer";
import { IsBoolean, IsISO8601, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

class AnswerItemDto {
  @IsNumber()
  questionNumber: number;

  @IsBoolean()
  isCorrect: boolean;

  @IsString()
  userAnswer: string;

  @IsString()
  correctAnswer: string;
}

export class ExamRecordDataDto
{
  @IsString()
  @IsNotEmpty()
  academy: string;

  @IsString()
  @IsNotEmpty()
  user: string;

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