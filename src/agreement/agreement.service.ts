import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { TermsAgreement } from "./agreement.entity";

@Injectable()
export class TermsAgreementService
{
  private readonly logger = new Logger(TermsAgreementService.name);

  constructor(
    @InjectRepository(TermsAgreement)
    private termsAgreementRepository: Repository<TermsAgreement>,
    private dataSource: DataSource,
  ) {}

  
}
