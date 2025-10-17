import { Controller, Post, Body } from "@nestjs/common";

import { RecordsService } from './records.service';

import { CurrentUser } from '../auth/decorators/currentUser.decorator';

import { SearchDetailRecordDto } from '../dto/searchOneWorkbookOneStudent.dto';
import { ExamRecordDataDto } from "../dto/examRecord.dto";
import { ReadFileParamsDto } from "../dto/readFile.dto";
import { RawLogInfoDto } from "../dto/log.dto";
import { OneStudentDto } from "../dto/other.dto";

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('allstudent')
  async getAllAcademyStudent(@CurrentUser('hashedAcademyId') hashedData: string)
  {
    return this.recordsService.getAllAcademyStudentRecord(hashedData);
  }

  @Post('onestudent')
  async getOneAcademyStudent(@CurrentUser('hashedAcademyId') hashedData: string, @Body() data: OneStudentDto)
  {
    return this.recordsService.getOneAcademyStudentRecord(hashedData, data.data);
  }

  @Post('oneonerecord')
  async getOneWorkbookExamRecord(@CurrentUser([ 'hashedUserId', 'hashedAcademyID' ]) hashedData: any, @Body() searchDetailRecordDto: SearchDetailRecordDto)
  {
    return this.recordsService.getOneStudentOneWorkbookRecord(hashedData.hashedUserId, hashedData.hashedAcademyID, searchDetailRecordDto);
  }

  @Post('createrecord')
  async createExamRecord(@CurrentUser([ 'hashedUserId', 'hashedAcademyID' ]) hashedData: any, @Body() examRecordData: ExamRecordDataDto, rawInfo: RawLogInfoDto)
  {
    return this.recordsService.saveOneStudentExamRecord(hashedData.hashedUserId, hashedData.hashedAcademyID, examRecordData, rawInfo);
  }

  @Post('readFile')
  async readExamRecordFile(@Body() readFileParams: ReadFileParamsDto)
  {
    return this.recordsService.readRecordJsonFile(readFileParams);
  }
}