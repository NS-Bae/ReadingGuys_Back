import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, MoreThan, Raw, Repository } from "typeorm";
import * as path from "path";
import * as fs from "fs";
import { Multer } from 'multer';
import { join } from "path";

/* import { AwsS3Service } from "./aws-s3.service"; */ // 서버 구동시 활성화
import { unlink } from "fs/promises";

import { Workbook } from './workbooks.entity';
import { Academy } from '../academy/academy.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { UploadBookDto } from '../dto/uploadWorkbook.dto';
import { DeleteAcademyCheckedDto } from '../dto/multiChecked.dto';
import { UpdateBookPaidDto } from '../dto/updateWorkbookPaid.dto';
import { decryptionBookDto } from "../dto/return.dto";
import { decryptionAES256GCM, encryptAES256GCM } from "../utils/encryption.service";
import { EventLogsService } from "../eventlogs/eventlogs.service";
import { RawLogInfoDto } from "../dto/log.dto";

@Injectable()
export class WorkbookService {
  private readonly logger = new Logger(WorkbookService.name);
  constructor (
    @InjectRepository(Workbook)
    private workbookRepository: Repository<Workbook>,
    @InjectRepository(Academy)
    private academyRepository: Repository<Academy>,
    private readonly firebaseService : FirebaseService,
    private readonly eventLogsService: EventLogsService,
    private dataSource: DataSource,
    /* private readonly awsS3Service: AwsS3Service, */
  ) {}

  refineDto(data1: string, data2: string, data3: string)
  {
    return {
      data1: data1,
      data2: data2,
      data3: data3,
    };
  }
  //booklist update
  async getWorkbookList(data: string)
  {
    const academy = await this.academyRepository.findOne({ where : { hashedAcademyId : data } });

    if(!academy)
    {
      throw new Error('학원정보가 없습니다');
    }

    const start = new Date(academy.startMonth);
    const startYear = start.getFullYear();
    const startMonth = start.getMonth() + 1;


    const workBooks = await this.workbookRepository
      .createQueryBuilder('workbook')
      .where(
        `(YEAR(workbook.releaseMonth) > :startYear OR
        (YEAR(workbook.releaseMonth) = :startYear AND MONTH(workbook.releaseMonth) >= :startMonth))`,
        { startYear, startMonth },
      )
      .orWhere('workbook.isPaid = false')
      .select([
        'workbook.workbookId',
        'workbook.workbookName',
        'workbook.Difficulty',
      ])
      .getMany();

    return workBooks;
  }
  //전체 문제집 불러오기
  async getWorkbookTotalList()
  {
    const rawWorkbooks = await this.workbookRepository.find();
    const workBooks: decryptionBookDto[] = rawWorkbooks.map(item => ({
      workbookId: item.workbookId,
      workbookName: item.workbookName,
      isPaid: item.isPaid,
      Difficulty: item.Difficulty,
      releaseMonth: item.releaseMonth,
      storageLink: decryptionAES256GCM(item.encryptedStorageLink, item.ivStorageLink, item.authTagStorageLink),
    }));

    return workBooks;
  }
  //workbookDownload
  async getWorkbookDownload(data: string, storageLink: string, rawInfo: RawLogInfoDto): Promise<string>
  {
    const filePath = path.resolve(storageLink);
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;

    const logCommonData = this.refineDto(data, device, ia);

    if(!fs.existsSync(filePath))
    {
      await this.eventLogsService.createBusinessLog({ log : {...logCommonData, data4: '교재다운로드실패'} });
      throw new Error('파일을 찾을 수 없습니다.');
    }
    await this.eventLogsService.createBusinessLog({ log : {...logCommonData, data4: '교재다운로드'} });

    return filePath;
  }
  //workbook upload push alert NOTYET
  async uploadWorkbook(data)
  {
    const userDeviceToken = 'test';
    const title = '새 문제집이 업로드되었습니다!';
    const body = '문제집을 확인하려면 앱을 열어보세요.';

    await this.firebaseService.sendNotification(userDeviceToken, title, body);
  }
  //workbook upload(local)(aws s3대응준비 완료)
  async uploadWorkbookFile(data: UploadBookDto, hashedData: string, rawInfo: RawLogInfoDto, file: Multer.file)
  {
    let filePath = null;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;

    const logCommonData = this.refineDto(hashedData, device, ia);

    if(!file)
    {
      throw new BadRequestException('업로드할 파일이 없습니다.');
    }

    filePath = join(process.cwd(), "uploads", file.filename);

    /* // AWS S3로 업로드
    let fileUrl = null;
    if (file) {
      fileUrl = await this.awsS3Service.uploadFile(file);
      console.log("📂 AWS S3 업로드 완료:", fileUrl);
    } */
    try
    {
      const encryptedData = encryptAES256GCM(filePath);
      const newWorkbook = {
        releaseMonth: data.releaseMonth,
        workbookName: data.workbookName,
        Difficulty: data.Difficulty,
        isPaid: data.isPaid,
        encryptedStorageLink: Buffer.from(encryptedData.encryptedData, 'hex'),
        ivStorageLink: Buffer.from(encryptedData.iv, 'hex'),
        authTagStorageLink: Buffer.from(encryptedData.authTag, 'hex'),
      }
      const savedWorkbook = await this.workbookRepository.save(newWorkbook);

      await this.eventLogsService.createBusinessLog({ log : {...logCommonData, data4: '교재업로드'} });

      return { message: "업로드 완료!", data: savedWorkbook };
    }
    catch(error)
    {
      console.error('업로드 중 오류 발생:', error);
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재업로드실패' }});
      throw new InternalServerErrorException('데이터 갱신중 오류가 발생했습니다.'); 
    }
  }
  //문제집 삭제
  async deleteWorkbook(deleteCheckedDto: DeleteAcademyCheckedDto, data: string, rawInfo: RawLogInfoDto): Promise<{ deletedCount: number }>
  {
    const { checkedRows } = deleteCheckedDto;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;

    const logCommonData = this.refineDto(data, device, ia);

    if(checkedRows.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재삭제실패' }});
      throw new NotFoundException('삭제할 데이터가 없습니다.');
    }
    //Transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try
    {
      const rawWorkbooks = await queryRunner.manager
        .createQueryBuilder(Workbook, 'workbook')
        .select(['workbook.encryptedStorageLink', 'workbook.ivStorageLink', 'workbook.authTagStorageLink'])
        .where('workbook.workbookId IN (:...workbookIds)', {
          workbookIds: checkedRows.map((item) => item.data1),
        })
        .getMany();

      if(rawWorkbooks.length === 0)
      {
        console.log('삭제할 문제집이 없습니다.');
        await queryRunner.rollbackTransaction();
        await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재삭제실패' }});
        return { deletedCount: 0 };
      }

      const WorkBooks = rawWorkbooks.map(item => ({
        storageLink: decryptionAES256GCM(item.encryptedStorageLink, item.ivStorageLink, item.authTagStorageLink),
      }));
      //저장소에 저장된 workbook삭제
      for(const workbook of WorkBooks)
      {
        //로컬(배포시 삭제)
        if(workbook.storageLink)
        {
          try
          {
            await unlink(workbook.storageLink);
            console.log(`📂 로컬 파일 삭제 완료`);
          }
          catch(error)
          {
            console.error(`❌ 로컬 파일 삭제 실패: ${workbook.storageLink}`, error);
            await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재삭제실패' }});
            throw new InternalServerErrorException('파일 삭제 중 오류 발생');
          }
        }
        //aws s3용 배포시 활성화
        /* if(workbook.storageLink)
        {
          try
          {
            await this.awsS3Service.deleteFile(workbook.storageLink);
            console.log(`📂 파일 삭제 완료`);
          }
          catch(error)
          {
            console.error('❌ 파일 삭제 실패', error);
            throw new InternalServerErrorException('AWS S3 파일 삭제 중 오류 발생');
          }
        } */
      }
      const deleteResult = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Workbook)
        .where('workbookId IN (:...workbookIds)', {
          workbookIds: checkedRows.map((item) => item.data1),
        })
        .execute();

      await queryRunner.commitTransaction();

      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재삭제성공' }});

      return { deletedCount: deleteResult.affected || 0 };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재삭제실패' }});
      throw new InternalServerErrorException('데이터 삭제중 오류가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  //문제집 무료공개 전환
  async updateWorkbookPaid(updateCheckedRow: UpdateBookPaidDto, hashedData: string, rawInfo: RawLogInfoDto): Promise<{updatedCount: number}>
  {
    const { data } = updateCheckedRow;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;
    let updatedCount = 0

    const logCommonData = this.refineDto(hashedData, device, ia);
    
    if(data.length === 0)
    {
      await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재상태변경실패' }});
      throw new NotFoundException('변경할 데이터가 없습니다.');
    }

    await Promise.all(
      data.map(async ({ data1, data2 }) => {
        const workbook = await this.workbookRepository.findOne({ where: { workbookId: data1, workbookName: data2 } });
  
        if(workbook) 
        {
          await this.workbookRepository.update({ workbookId: data1, workbookName: data2 }, { isPaid: !workbook.isPaid });
          updatedCount++;
        }
      })
    );

    await this.eventLogsService.createBusinessLog({log: { ...logCommonData, data4: '교재상태변경성공' }});

    return { updatedCount }
  }
  //
}
