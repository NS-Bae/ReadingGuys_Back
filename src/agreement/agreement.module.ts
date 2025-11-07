import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { TermsAgreementController } from "./agreement.controller";
import { TermsAgreementService } from "./agreement.service";
import { TermsAgreement } from "./agreement.entity";
import { EventLogsModule } from "../eventlogs/eventlogs.module";
import { Terms } from "./terms.entity";


@Module({
  imports: [TypeOrmModule.forFeature([TermsAgreement, Terms]), EventLogsModule],
  controllers: [TermsAgreementController],
  providers: [TermsAgreementService],
  exports: [TermsAgreementService],
})

export class TermsAgreementModule {}