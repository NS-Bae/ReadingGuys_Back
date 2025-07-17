import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';

import { Records } from './records.entity';
import { SearchDetailRecordDto } from '../dto/searchOneWorkbookOneStudent.dto';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);
  constructor(
    @InjectRepository(Records)
    private recordsRepository: Repository<Records>,
    private dataSource: DataSource,
  ) {}

  async getAllAcademyStudentRecord(a: { academyId: string })
  {
    const aa = a.academyId;
    try
    {
      const records = await this.recordsRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.academy', 'academy')
        .leftJoinAndSelect('records.workbook', 'workbook')
        .leftJoinAndSelect('records.user', 'user')
        .select([
          "user.id as UserID",
          "user.userName as UserName",
          "workbook.workbookName as WorkbookName",
          "records.ExamDate as ExamDate",
          "records.ProgressRate as ProgressRate",
        ])
        .where('academy.academyId = :academyId', { academyId: aa })
        .getRawMany();

      return records.map(record => ({
        ...record,
        examDate: record.ExamDate.toLocaleDateString("ko-KR", {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }),
      }));
    } 
    catch (error) 
    {
      console.error('쿼리 실행 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async getOneAcademyStudentRecord(data: {data: string, academyId: string})
  {
    const splitData = data.data.split('_');
    const splitId = splitData[0];
    const splitName = splitData[1];
    try
    {
      const records = await this.recordsRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.academy', 'academy')
        .leftJoinAndSelect('records.workbook', 'workbook')
        .leftJoinAndSelect('records.user', 'user')
        .select([
          "user.id as UserID",
          "user.userName as UserName",
          "workbook.workbookName as WorkbookName",
          "records.ExamDate as ExamDate",
          "records.ProgressRate as ProgressRate",
        ])
        .where('academy.academyId = :academyId', { academyId: data.academyId })
        .andWhere('user.id = :id', {id: splitId})
        .andWhere('user.userName = :userName', {userName: splitName})
        .getRawMany();

      return records.map(record => ({
        ...record,
        examDate: record.ExamDate.toLocaleDateString("ko-KR", {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }),
      }));
    } 
    catch (error) 
    {
      console.error('쿼리 실행 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async getOneStudentOneWorkbookRecord(searchDetailRecordDto: SearchDetailRecordDto)
  {
    const { refineData } = searchDetailRecordDto;

    try
    {
      const records = await this.recordsRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.academy', 'academy')
        .leftJoinAndSelect('records.workbook', 'workbook')
        .leftJoinAndSelect('records.user', 'user')
        .select([
          "workbook.workbookName as WorkbookName",
          "records.ExamDate as ExamDate",
          "records.ProgressRate as ProgressRate",
          "records.RecordLink as RecordLink",
        ])
        .where('workbook.workbookId = :workbookId', { workbookId: refineData.workbookId })
        .andWhere('academy.academyId = :academyId', { academyId: refineData.academyId })
        .andWhere('user.id = :id', {id: refineData.userId})
        .andWhere('user.userName = :userName', {userName: refineData.userName})
        .getRawMany();
      
      return records.map(record => ({
        ...record,
        examDate: record.ExamDate.toLocaleDateString("ko-KR", {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }),
      }));
    }
    catch(error)
    {
      console.error('쿼리 실행 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }
}