import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkbookController } from './workbooks.controller';
import { WorkbookService } from './workbooks.service';
import { Workbook } from './workbooks.entity';
import { Academy } from '../academy/academy.entity';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workbook, Academy]), FirebaseModule],
  controllers: [WorkbookController],
  providers: [WorkbookService, FirebaseService],
  exports: [WorkbookService],
})
export class WorkbooksModule {}
