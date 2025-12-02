import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Multer } from 'multer';

import { TermsAgreement } from "./agreement.entity";
import { Terms } from "./terms.entity";

@Injectable()
export class TermsAgreementService
{
  private readonly logger = new Logger(TermsAgreementService.name);

  constructor(
    @InjectRepository(TermsAgreement)
    private termsAgreementRepository: Repository<TermsAgreement>,
    @InjectRepository(Terms)
    private termsRepository: Repository<Terms>,
    private dataSource: DataSource,
  ) {}

  async uploadNewTermsFile(data: any, hashedData: string, file: Multer.file)
  {

  }

  async getLatestTerm(data: any)
  {

  }

  async agreeTerm(data: any)
  {

  }

  async withdrawTerm(data: any)
  {

  }
}
