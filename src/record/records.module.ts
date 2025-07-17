import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { Records } from './records.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Records])],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})

export class RecordsModule {}