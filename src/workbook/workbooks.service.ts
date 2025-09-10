import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, MoreThan, Repository } from "typeorm";
import * as path from "path";
import * as fs from "fs";
import { Multer } from 'multer';
import { join } from "path";

/* import { AwsS3Service } from "./aws-s3.service"; */ // 서버 구동시 활성화

import { Workbook } from './workbooks.entity';
import { Academy } from '../academy/academy.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { UploadBookDto } from '../dto/uploadWorkbook.dto';
import { DeleteCheckedDto } from '../dto/multiChecked.dto';
import { UpdateBookPaidDto } from '../dto/updateWorkbookPaid.dto';
import { unlink } from "fs/promises";

@Injectable()
export class WorkbookService {
  private readonly logger = new Logger(WorkbookService.name);
  constructor (
    @InjectRepository(Workbook)
    private workbookRepository: Repository<Workbook>,
    @InjectRepository(Academy)
    private academyRepository: Repository<Academy>,
    private readonly firebaseService : FirebaseService,
    private dataSource: DataSource,
    /* private readonly awsS3Service: AwsS3Service, */
  ) {}
  //booklist update
  async getWorkbookList(academyId: string)
  {
    this.logger.log(academyId);
    const academy = await this.academyRepository.findOne({ where : { academyId : academyId } });

    if(!academy)
    {
      throw new Error('학원정보가 없습니다');
    }

    const startMonth = academy.startMonth;

    const workbooks = await this.workbookRepository.find({
      where : {
        releaseMonth : MoreThan(startMonth),
      }, 
      select : ['workbookId', 'workbookName', 'Difficulty', 'storageLink'],
    });
    return workbooks;
  }
  //전체 문제집 불러오기
  async getWorkbookTotalList()
  {
    const workbooks = await this.workbookRepository.find();
    return workbooks;
  }
  //workbookDownload
  async getWorkbookDownload(storageLink: string): Promise<string>
  {
    this.logger.log(storageLink);
    const filePath = path.resolve(storageLink);

    if (!fs.existsSync(filePath)) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    return filePath;
  }
  //workbook upload push alert
  async uploadWorkbook(data)
  {
    console.log('문제집 업로드 완료');

    const userDeviceToken = 'test';
    const title = '새 문제집이 업로드되었습니다!';
    const body = '문제집을 확인하려면 앱을 열어보세요.';

    await this.firebaseService.sendNotification(userDeviceToken, title, body);
  }
  //workbook upload(local)(aws s3대응준비 완료)
  async uploadWorkbookFile(data: UploadBookDto, file: Multer.file)
  {
    const queryRunner = this.dataSource

    let filePath = null;

    if(file)
    {
      filePath = join(process.cwd(), "uploads", file.filename);
      console.log("📂 파일 저장 경로:", filePath);
    }
    /* // AWS S3로 업로드
    let fileUrl = null;
    if (file) {
      fileUrl = await this.awsS3Service.uploadFile(file);
      console.log("📂 AWS S3 업로드 완료:", fileUrl);
    } */

    const newWorkbook = {
      releaseMonth: data.releaseMonth,
      workbookName: data.workbookName,
      Difficulty: data.Difficulty,
      isPaid: data.isPaid,
      storageLink: filePath,
    }

    const savedWorkbook = await this.workbookRepository.save(newWorkbook);
    return { message: "업로드 완료!", data: savedWorkbook };
  }
  //문제집 삭제
  async deleteWorkbook(deleteCheckedDto: DeleteCheckedDto): Promise<{ deletedCount: number }>
  {
    const { checkedRows } = deleteCheckedDto;
    if(checkedRows.length === 0)
    {
      throw new NotFoundException('삭제할 데이터가 없습니다.');
    }
    //Transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try
    {
      const workbooks = await queryRunner.manager
        .createQueryBuilder(Workbook, 'workbook')
        .select('workbook.storageLink')
        .where('workbook.workbookId IN (:...workbookIds)', {
          workbookIds: checkedRows.map((item) => item.data1),
        })
        .getMany();

      if(workbooks.length === 0)
      {
        console.log('삭제할 문제집이 없습니다.');
        await queryRunner.rollbackTransaction();
        return ;
      }
      //저장소에 저장된 workbook삭제
      for(const workbook of workbooks)
      {
        //로컬(배포시 삭제)
        if(workbook.storageLink)
        {
          try
          {
            const filePath = join(workbook.storageLink);
            await unlink(filePath);
            console.log(`📂 로컬 파일 삭제 완료`);
          }
          catch(error)
          {
            console.error(`❌ 로컬 파일 삭제 실패: ${workbook.storageLink}`, error);
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
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Workbook)
        .where('workbookId IN (:...workbookIds)', {
          workbookIds: checkedRows.map((item) => item.data1),
        })
        .execute();

      await queryRunner.commitTransaction();

      return { deletedCount: workbooks.length };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터 삭제중 오류가 발생했습니다.');
    }
    finally
    {
      await queryRunner.release();
    }
  }
  //문제집 무료공개 전환
  async updateWorkbookPaid(updateCheckedRow: UpdateBookPaidDto): Promise<{updatedCount: number}>
  {
    const { data } = updateCheckedRow;
    let updatedCount = 0
    
    if(data.length === 0)
    {
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

    return { updatedCount }
  }
  //
}
