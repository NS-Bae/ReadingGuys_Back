import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { TermsAgreementController } from "./agreement.controller";
import { TermsAgreementService } from "./agreement.service";
import { TermsAgreement } from "./agreement.entity";
import { Terms } from "./terms.entity";
import { EventLogsModule } from "../eventlogs/eventlogs.module";
import { AwsS3Service } from '../utils/aws-s3.service';


@Module({
  imports: [TypeOrmModule.forFeature([TermsAgreement, Terms]), EventLogsModule],
  controllers: [TermsAgreementController],
  providers: [TermsAgreementService, AwsS3Service],
  exports: [TermsAgreementService],
})

export class TermsAgreementModule {}