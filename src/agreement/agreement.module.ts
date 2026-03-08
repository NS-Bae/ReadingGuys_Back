import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { TermsAgreementController } from "./agreement.controller";
import { EventLogsModule } from "../eventlogs/eventlogs.module";
import { AwsS3Service } from '../utils/aws-s3.service';
import { TermsAgreementService } from "./agreement.service";

import { TermsAgreement } from "./agreement.entity";
import { Terms } from "./terms.entity";
import { User } from "../users/users.entity";


@Module({
  imports: [TypeOrmModule.forFeature([TermsAgreement, Terms, User]), EventLogsModule],
  controllers: [TermsAgreementController],
  providers: [TermsAgreementService, AwsS3Service],
  exports: [TermsAgreementService],
})

export class TermsAgreementModule {}