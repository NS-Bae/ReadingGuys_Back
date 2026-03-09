import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Multer } from 'multer';

import { TermsAgreement } from "./agreement.entity";
import { Terms } from "./terms.entity";
import { User } from '../users/users.entity';

import { AwsS3Service } from "../utils/aws-s3.service";
import { decryptionAES256GCM, encryptAES256GCM } from '../utils/encryption.service';
import { EventLogsService } from "../eventlogs/eventlogs.service";

import { RawLogInfoDto } from '../dto/log.dto';
import { UpdateTermsDto } from "../dto/other.dto";
import { TermsStatus, TermsTypes } from "../others/other.types";

@Injectable()
export class TermsAgreementService
{
  private readonly logger = new Logger(TermsAgreementService.name);

  constructor(
    @InjectRepository(TermsAgreement)
    private termsAgreementRepository: Repository<TermsAgreement>,
    @InjectRepository(Terms)
    private termsRepository: Repository<Terms>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private s3Service: AwsS3Service,
    private readonly eventLogsService: EventLogsService,
  ) {}

  refineDto(data1: string, data2: string, data3: string)
  {
    return {
      data1: data1,
      data2: data2,
      data3: data3,
    };
  }
  async uploadNewTermsFile(data: any, hashedData: string, rawInfo: RawLogInfoDto)
  {
    const category = data.main;
    const contents = data.contents;
    const device = rawInfo.rawInfo.deviceInfo;
    const ia = rawInfo.rawInfo.IPA;
    const time = new Date();

    const logCommonData = this.refineDto(hashedData, device, ia);
    const fileName = `${category}_${time}.md`;
    const key = `coreDocuments/${category}/${fileName}`;

    const result = await this.s3Service.uploadTerms(contents, key);
    const encryptFilePath = encryptAES256GCM(result);

    try
    {
      await this.dataSource.transaction(async (manager) => {
          const term = manager.create(Terms, {
            termsType: category,
            title: fileName,
            encryptedStorageLink: Buffer.from(encryptFilePath.encryptedData, 'hex'),
            ivStorageLink: Buffer.from(encryptFilePath.iv, 'hex'),
            authTagStorageLink: Buffer.from(encryptFilePath.authTag, 'hex'),
            effectiveDate: time,//테스트
            createdBy: hashedData,
            createdAt: time,
        });
        
        const saveRecord = await manager.save(term);

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
    console.log(key);
  }

  async getAllTerms(data: string)
  {
    const terms = await this.termsRepository
      .createQueryBuilder('terms')
      .where('terms.termsType = :type', { type: data })
      .orderBy('terms.createdAt', 'DESC')
      .getMany();

    const createdByHashes = [...new Set(terms.map(term => term.createdBy))];

    const users = await this.userRepository.find({
      where: {
        hashedUserId: In(createdByHashes),
      }
    });

    const userMap = new Map();

    for(const user of users)
    {
      const userID = decryptionAES256GCM(
        user.encryptedUserId,
        user.ivUserId,
        user.authTagUserId,
      );

      userMap.set(user.hashedUserId, userID);
    }

    const result = terms.map(term => ({
      id: term.id,
      title: term.title,
      termsType: term.termsType,
      status: term.status,
      createdAt: term.createdAt,
      effectiveDate: term.effectiveDate,
      createdBy: userMap.get(term.createdBy) || '알 수 없음',
    }));

    return result;
  }

  async updateTermsState(data: UpdateTermsDto, hashedData: string, rawInfo: RawLogInfoDto)
  {
    const {type, id} = data.data;
    const numericId = Number(id);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      const target = await queryRunner.manager.findOne(Terms, {
        where: { id: numericId, termsType: type },
      });

      if(!target)
      {
        throw new Error('약관을 찾을 수 없습니다.');
      }
      if(target.status === TermsStatus.활성화)
      {
        throw new Error('활성화된 약관을 비활성화 할 수 없습니다.');
      }

      await queryRunner.manager.update(
        Terms,
        { termsType: type },
        { status: TermsStatus.비활성화 },
      );
      await queryRunner.manager.update(
        Terms,
        { id: numericId },
        { status: TermsStatus.활성화, effectiveDate: new Date() },
      );

      await queryRunner.commitTransaction();

      return { message: '약관이 활성화되었습니다.', id, type };
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();

      console.error('약관 변경 실패', error);
      throw error;
    }
    finally
    {
      await queryRunner.release();
    }
  }

  async agreeTerm(data: any)
  {

  }

  async withdrawTerm(data: any)
  {

  }
}
