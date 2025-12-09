import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { Records } from './records.entity';
import { EventLogsModule } from '../eventlogs/eventlogs.module';
import { AwsS3Service } from '../utils/aws-s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Records]), EventLogsModule],
  controllers: [RecordsController],
  providers: [RecordsService, AwsS3Service],
  exports: [RecordsService],
})

export class RecordsModule {}