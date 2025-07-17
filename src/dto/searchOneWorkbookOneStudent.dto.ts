import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";


class refineDataDto
{
  @IsString()
  academyId: string;
  @IsString()
  userId: string;
  @IsString()
  userName: string;
  @IsString()
  workbookId: string;
};

export class SearchDetailRecordDto
{
  @ValidateNested({ each: true })
  @Type(() => refineDataDto)
  refineData: refineDataDto;
}