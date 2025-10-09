import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";


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