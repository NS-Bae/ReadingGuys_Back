import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkbookController } from './workbooks.controller';
import { WorkbookService } from './workbooks.service';
import { Workbook } from './workbooks.entity';
import { Academy } from '../academy/academy.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { EventLogsModule } from '../eventlogs/eventlogs.module';
import { AwsS3Service } from './aws-s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workbook, Academy]), FirebaseModule, EventLogsModule],
  controllers: [WorkbookController],
  providers: [WorkbookService, FirebaseService, AwsS3Service],
  exports: [WorkbookService],
})
export class WorkbooksModule {}
