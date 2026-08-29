import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, LessThanOrEqual, Repository } from "typeorm";
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
import { TermDataParamsDto } from "src/dto/readFile.dto";

@Injectable()
export class TermsAgreementService
{
  private readonly logger = new Logger(TermsAgreementService.name);
  private readonly requiredTermsTypes: TermsTypes[] = [
    TermsTypes.이용약관,
    TermsTypes.개인정보,
  ];

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
  async uploadNewTermsFile(
    data: any,
    hashedUserId: string,
    rawInfo: RawLogInfoDto,
  ) {
    const termsType = data.main as TermsTypes;
    const contents = data.contents?.trim();
    const title = data.title?.trim();
    const version = data.Version?.trim();
    const effectiveDate = new Date(data.effectiveDate);

    if(
      !Object.values(TermsTypes).includes(termsType) ||
      !contents ||
      !title ||
      !version ||
      Number.isNaN(effectiveDate.getTime())
    ) {
      throw new BadRequestException(
        '문서 종류, 제목, 버전, 시행일, 본문을 모두 입력해 주세요.',
      );
    }

    const duplicate =
      await this.termsRepository.findOne({
        where: {
          termsType,
          Version: version,
        },
      });

    if(duplicate) {
      throw new ConflictException(
        '같은 종류와 버전의 문서가 이미 존재합니다.',
      );
    }

    const safeVersion = version.replace(
      /[^0-9A-Za-z._-]/g,
      '_',
    );

    const fileName =
      `${Date.now()}_${safeVersion}.md`;

    const key =
      `coreDocuments/${termsType}/${fileName}`;

    const storageKey =
      await this.s3Service.uploadTerms(
        contents,
        key,
      );

    const encryptedPath =
      encryptAES256GCM(storageKey);

    try {
      const savedDocument =
        await this.dataSource.transaction(
          async manager => {
            const document =
              manager.create(Terms, {
                termsType,
                title,
                Version: version,

                encryptedStorageLink:
                  Buffer.from(
                    encryptedPath.encryptedData,
                    'hex',
                  ),

                ivStorageLink:
                  Buffer.from(
                    encryptedPath.iv,
                    'hex',
                  ),

                authTagStorageLink:
                  Buffer.from(
                    encryptedPath.authTag,
                    'hex',
                  ),

                effectiveDate,
                createdBy: hashedUserId,
                createdAt: new Date(),
              });

            return manager.save(document);
          },
        );

      return {
        message: '문서가 등록되었습니다.',
        data: {
          id: savedDocument.id,
          termsType:
            savedDocument.termsType,
          title: savedDocument.title,
          Version: savedDocument.Version,
          effectiveDate:
            savedDocument.effectiveDate,
          status: savedDocument.status,
          createdAt:
            savedDocument.createdAt,
        },
      };
    }
    catch(error) {
      this.logger.error(
        '문서 DB 저장 실패',
        error,
      );

      if(
        (error as any)?.code ===
        'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          '같은 종류와 버전의 문서가 이미 존재합니다.',
        );
      }

      throw new InternalServerErrorException(
        '문서 정보를 저장하지 못했습니다.',
      );
    }
  }

  async getAllTerms(type: TermsTypes) {
  const documents =
    await this.termsRepository.find({
      where: {
        termsType: type,
      },
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });

  return documents.map(document => ({
    id: document.id,
    termsType: document.termsType,
    title: document.title,
    Version: document.Version,
    effectiveDate:
      document.effectiveDate,
    status: document.status,
    createdAt: document.createdAt,
  }));
}

async getDocumentById(
  id: number,
): Promise<TermDataParamsDto> {
  const document =
    await this.termsRepository.findOne({
      where: {
        id,
      },
    });

  if(!document) {
    throw new NotFoundException(
      '문서를 찾을 수 없습니다.',
    );
  }

  const key =
    decryptionAES256GCM(
      document.encryptedStorageLink,
      document.ivStorageLink,
      document.authTagStorageLink,
    );

  const content =
    await this.s3Service.readTerms(key);

  return {
    id: document.id,
    termsType: document.termsType,
    title: document.title,
    Version: document.Version,
    effectiveDate:
      document.effectiveDate,
    status: document.status,
    createdBy: document.createdBy,
    createdAt: document.createdAt,
    content,
  };
}

  //DB조회
  async findCurrentActiveDocument(type: TermsTypes)
  {
    const document = await this.termsRepository.findOne({
      where: {
        termsType: type,
        status: TermsStatus.활성화,
        effectiveDate: LessThanOrEqual(new Date()),
      },
      order: {
        effectiveDate: 'DESC',
        id: 'DESC',
      },
    });

    if(!document)
    {
      throw new NotFoundException('현재 활성화된 약관이 없습니다.');
    }

    console.log('test', document);

    return document;
  }

  //조회된 약관 데이터 읽기
  async getCurrentActiveDocument(type: TermsTypes)
  {
    const rawDocument = await this.findCurrentActiveDocument(type);
    const key = decryptionAES256GCM( rawDocument.encryptedStorageLink, rawDocument.ivStorageLink, rawDocument.authTagStorageLink );
    const content = await this.s3Service.readTerms(key);
    const refineDocument: TermDataParamsDto = {
      id: rawDocument.id,
      termsType: rawDocument.termsType,
      title: rawDocument.title,
      Version: rawDocument.Version,
      effectiveDate: rawDocument.effectiveDate,
      status: rawDocument.status,
      createdBy: rawDocument.createdBy,
      createdAt: rawDocument.createdAt,
      content: content,
    }

    return refineDocument;
  }

  async updateTermsState(data: UpdateTermsDto, hashedData: string, rawInfo: RawLogInfoDto)
  {
    const { type, id } = data.data;
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

  async agreeTerm(hashedData: string, type: TermsTypes, agreed: boolean, rawInfo: RawLogInfoDto)
  {
    const currentDocument = await this.findCurrentActiveDocument(type);
    const findExisting = await this.termsAgreementRepository.findOne({
      where: {
        hashedUserId: hashedData,
        termsType: type,
        version: currentDocument.Version,
      },
    });

    const agreement = findExisting ?? this.termsAgreementRepository.create({
      hashedUserId: hashedData,
      termsType: type,
      version: currentDocument.Version,
    });
    agreement.agreed = agreed;
    agreement.agreedAt = new Date();

    return this.termsAgreementRepository.save(agreement);
  }

  async findRequiredTerms(hashedUserId: string, rawInfo: RawLogInfoDto)
  {
    const requiredTerms: {
      termsType: TermsTypes;
      title: string;
      Version: string;
    }[] = [];

    for(const termsType of this.requiredTermsTypes)
    {
      const currentDocument = await this.findCurrentActiveDocument(termsType);

      const agreement = await this.termsAgreementRepository.findOne({
        where: {
          hashedUserId,
          termsType,
          version: currentDocument.Version,
          agreed: true,
        },
      });

      if(!agreement)
      {
        requiredTerms.push({
          termsType: currentDocument.termsType,
          title: currentDocument.title,
          Version: currentDocument.Version,
        });
      }
    }

    return { requiredTerms };
  }
}
