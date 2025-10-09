import { Controller, Post, Body } from "@nestjs/common";

import { RecordsService } from './records.service';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';

import { SearchDetailRecordDto } from '../dto/searchOneWorkbookOneStudent.dto';
import { ExamRecordDataDto } from "../dto/createExamRecord.dto";
import { ReadFileParamsDto } from "../dto/readFile.dto";

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('allstudent')
  async getAllAcademyStudent(@CurrentUser('hashedAcademyId') hashedData: string)
  {
    return this.recordsService.getAllAcademyStudentRecord(hashedData);
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