import { Controller, Post, Body } from "@nestjs/common";

import { RecordsService } from './records.service';
import { SearchDetailRecordDto } from '../dto/searchOneWorkbookOneStudent.dto';
import { ExamRecordDataDto } from "src/dto/createExamRecord.dto";
import { ReadFileParamsDto } from "src/dto/reedFile.dto";

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('allstudent')
  async getAllAcademyStudent(@Body() academyIds: { academyId: string } )
  {
    return this.recordsService.getAllAcademyStudentRecord(academyIds);
  }

  @Post('onestudent')
  async getOneAcademyStudent(@Body() data: {data: string, academyId: string } )
  {
    return this.recordsService.getOneAcademyStudentRecord(data);
  }

  @Post('oneonerecord')
  async getOneWorkbookExamRecord(@Body() searchDetailRecordDto: SearchDetailRecordDto)
  {
    return this.recordsService.getOneStudentOneWorkbookRecord(searchDetailRecordDto);
  }

  @Post('createrecord')
  async createExamRecord(@Body() examRecordData: ExamRecordDataDto)
  {
    return this.recordsService.saveOneStudentExamRecord(examRecordData);
  }

  @Post('readFile')
  async readExamRecordFile(@Body() readFileParams: ReadFileParamsDto)
  {
    const payload = readFileParams;
    return this.recordsService.readRecordJsonFile(readFileParams);
  }
}