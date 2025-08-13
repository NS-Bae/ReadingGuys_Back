import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';

import * as path from 'path';
import * as fs from 'fs';

import { Records } from './records.entity';
import { SearchDetailRecordDto } from '../dto/searchOneWorkbookOneStudent.dto';
import { ExamRecordDataDto } from 'src/dto/createExamRecord.dto';
/* import { S3Service } from '../aws/s3.service';
 */
@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);
  constructor(
    @InjectRepository(Records)
    private recordsRepository: Repository<Records>,
    private dataSource: DataSource,
/*     private s3Service: S3Service,
 */  ) {}

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

  async saveOneStudentExamRecord(examRecordData: ExamRecordDataDto)
  {
    const payload = examRecordData;
    const kstSubmitTime = this.toKST(examRecordData.submitDate);

    const baseDir = path.join(process.cwd(), 'records');
    if(!fs.existsSync(baseDir))
    {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    //학원폴더 검증
    const academyFolder = path.join(baseDir, payload.academy);
    if(!fs.existsSync(academyFolder))
    {
      fs.mkdirSync(academyFolder, { recursive: true });
    }
    //사용자 폴더 검증
    const userFolder = path.join(academyFolder, payload.user)
    if(!fs.existsSync(userFolder))
    {
      fs.mkdirSync(userFolder, { recursive: true })
    }
    //파일 생성
    const fileName = `${payload.academy}_${payload.user}_${kstSubmitTime}.json`;
    const filePath = path.join(userFolder, fileName);

    //저장(LOCAL)
    fs.writeFileSync(filePath, JSON.stringify(examRecordData, null, 2));
    //저장(AWS)
    /* const s3Key = `records/${payload.academy}/${payload.user}/${fileName}`;
    const s3FileUrl = await this.s3Service.uploadRecordFile(filePath, s3Key); */

    //DB
    try
    {
      await this.dataSource.transaction(async (manager) => {
        const record = manager.create(Records, {
          AcademyID: payload.academy,
          UserID: payload.user,
          WorkbookID: payload.workbook,
          ExamDate: new Date(payload.submitDate),
          ProgressRate: Number(payload.correctCount.toFixed(2)),
          RecordLink: filePath,//s3FileUrl
        });

        await manager.save(record);
      });

      return { message: '시험 결과 저장 완료', filePath };
    }
    catch(error)
    {
      console.error('DB 저장 오류:', error);
      throw new InternalServerErrorException('시험 결과 DB 저장 실패');
    }
  }
}