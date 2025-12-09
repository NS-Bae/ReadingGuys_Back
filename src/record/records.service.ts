import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as path from 'path';
import * as fs from 'fs';

import { Records } from './records.entity';

import { decryptionAES256GCM, encryptAES256GCM } from '../utils/encryption.service';
import { EventLogsService } from "../eventlogs/eventlogs.service";
import { AwsS3Service } from "../utils/aws-s3.service";

import { ExamRecordDataDto, SearchDetailRecordDto } from '../dto/examRecord.dto';
import { ReadFileParamsDto } from '../dto/readFile.dto';
import { decryptionDto1, decryptionDto2 } from '../dto/return.dto';
import { RawLogInfoDto } from '../dto/log.dto';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);
  constructor(
    @InjectRepository(Records)
    private recordsRepository: Repository<Records>,
    private readonly eventLogsService: EventLogsService,
    private dataSource: DataSource,
    private s3Service: AwsS3Service,
  ) {}

  private toKST(dateString: string)
  {
    const date = new Date(dateString);

    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const kst = new Date(utc + 9 * 60 * 60 * 1000);

    const year = kst.getFullYear();
    const month = String(kst.getMonth() + 1).padStart(2, '0');
    const day = String(kst.getDate()).padStart(2, '0');
    const hours = String(kst.getHours()).padStart(2, '0');
    const minutes = String(kst.getMinutes()).padStart(2, '0');
    const seconds = String(kst.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
  }
  refineDto(data1: string, data2: string, data3: string)
  {
    return {
      data1: data1,
      data2: data2,
      data3: data3,
    };
  }

  async getAllAcademyStudentRecord(data: string)
  {
    try
    {
      const rawRecords = await this.recordsRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.academy', 'academy')
        .leftJoinAndSelect('records.workbook', 'workbook')
        .leftJoinAndSelect('records.user', 'user')
        .select([
          "user.hashedUserId as hashedUserId",
          "user.encryptedUserId as encryptedUserId",
          "user.ivUserId as ivUserId",
          "user.authTagUserId as authTagUserId",
          "user.encryptedUserName as encryptedUserName",
          "user.ivUserName as ivUserName",
          "user.authTagUserName as authTagUserName",
          "workbook.workbookName as WorkbookName",
          "records.ExamDate as ExamDate",
          "records.ProgressRate as ProgressRate",
        ])
        .where('academy.hashedAcademyId = :hashedAcademyId', { hashedAcademyId: data })
        .getRawMany();

      const refineTimeRawData = rawRecords.map(item => ({
        ...item,
        examDate: item.ExamDate.toLocaleDateString("ko-KR", {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }),
      }));

      const decryptionRefineData: decryptionDto1[] = refineTimeRawData.map(item => ({
        hashedUserId: item.hashedUserId,
        rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
        rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
        WorkbookName: item.WorkbookName,
        ExamDate: item.examDate,
        ProgressRate: item.ProgressRate,
      }));

      return decryptionRefineData;
    }
    catch (error)
    {
      console.error('쿼리 실행 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async getOneAcademyStudentRecord(hashedData, data: string)
  {
    try
    {
      const records = await this.recordsRepository
        .createQueryBuilder('records')
        .leftJoinAndSelect('records.academy', 'academy')
        .leftJoinAndSelect('records.workbook', 'workbook')
        .leftJoinAndSelect('records.user', 'user')
        .select([
          "user.hashedUserId as hashedUserId",
          "user.encryptedUserId as encryptedUserId",
          "user.ivUserId as ivUserId",
          "user.authTagUserId as authTagUserId",
          "user.encryptedUserName as encryptedUserName",
          "user.ivUserName as ivUserName",
          "user.authTagUserName as authTagUserName",
          "workbook.workbookName as WorkbookName",
          "records.ExamDate as ExamDate",
          "records.ProgressRate as ProgressRate",
        ])
        .where('academy.hashedAcademyId = :hashedAcademyId', { hashedAcademyId: hashedData })
        .andWhere('user.hashedUserId = :hashedUserId', {hashedUserId: data})
        .getRawMany();

      const refineTimeRawData =  records.map(record => ({
        ...record,
        examDate: record.ExamDate.toLocaleDateString("ko-KR", {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }),
      }));

      const decryptionRefineData: decryptionDto1[] = refineTimeRawData.map(item => ({
        hashedUserId: item.hashedUserId,
        rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
        rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
        WorkbookName: item.WorkbookName,
        ExamDate: item.examDate,
        ProgressRate: item.ProgressRate,
      }));

      return decryptionRefineData;
    } 
    catch (error) 
    {
      console.error('쿼리 실행 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async getOneStudentOneWorkbookRecord(hashedUserId: string, hashedAcademyId: string, searchDetailRecordDto: SearchDetailRecordDto)
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
          "records.encryptedRecordLink as encryptedRecordLink",
          "records.ivRecordLink as ivRecordLink",
          "records.authTagRecordLink as authTagRecordLink",
        ])
        .where('workbook.workbookId = :workbookId', { workbookId: refineData.workbookId })
        .andWhere('academy.hashedAcademyId = :hashedAcademyId', { hashedAcademyId })
        .andWhere('user.hashedUserId = :hashedUserId', { hashedUserId })
        .getRawMany();
      
      const refineTimeRawData = records.map(record => ({
        ...record,
        examDate: record.ExamDate.toLocaleDateString("ko-KR", {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        }),
      }));

      const decryptionRefineData: decryptionDto2[] = refineTimeRawData.map(item => ({
        WorkbookName: item.WorkbookName,
        ExamDate: item.examDate,
        ProgressRate: item.ProgressRate,
        RecordLink: decryptionAES256GCM(item.encryptedRecordLink, item.ivRecordLink, item.authTagRecordLink), 
      }));

      return decryptionRefineData;
    }
    catch(error)
    {
      console.error('쿼리 실행 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async saveOneStudentExamRecord(hashedUser: string, hashedAcademy: string, examRecordData: ExamRecordDataDto, rawInfo: RawLogInfoDto)
  {
    const payload = examRecordData;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;
    
    const kstSubmitTime = this.toKST(examRecordData.submitDate);
    const logCommonData = this.refineDto(hashedUser, device, ia);

    const fileName = `${hashedAcademy}_${hashedUser}_${kstSubmitTime}.json`;
    const key = `records/${hashedAcademy}/${hashedUser}/${fileName}`;

    //저장(AWS)
    const result = await this.s3Service.uploadRecord(examRecordData, key);

    const encryptFilePath = encryptAES256GCM(result);
    //DB
    try
    {
      await this.dataSource.transaction(async (manager) => {
        const record = manager.create(Records, {
          hashedAcademyId: hashedAcademy,
          hashedUserId: hashedUser,
          workbookId: payload.workbook,
          examDate: new Date(payload.submitDate),
          progressRate: Number(payload.correctCount.toFixed(2)),
          encryptedRecordLink: Buffer.from(encryptFilePath.encryptedData, 'hex'),//s3FileUrl
          ivRecordLink: Buffer.from(encryptFilePath.iv, 'hex'),
          authTagRecordLink: Buffer.from(encryptFilePath.authTag, 'hex'),
        });

        const saveRecord = await manager.save(record);

        return saveRecord;
      });
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '결과저장' }});

      return { message: '시험 결과 저장 완료', result };
    }
    catch(error)
    {
      console.error('DB 저장 오류:', error);
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '결과저장실패' }});
      throw new InternalServerErrorException('시험 결과 DB 저장 실패');
    }
  }

  async readRecordJsonFile(readFileParams: ReadFileParamsDto)
  {
    const link = readFileParams.readFileParams.recordLink;
    if(fs.existsSync(link))
    {
      const content = fs.readFileSync(link, 'utf-8');
      return JSON.parse(content);
    }
    else
    {
      return { error: 'File not found' };
    }
  }
}