import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Academy } from './academy.entity';
import { AcademyService } from './academy.service';
import { AcademyController } from './academy.controller';
import { EventLogsModule } from '../eventlogs/eventlogs.module';

@Module({
  imports : [TypeOrmModule.forFeature([ Academy, User ]), EventLogsModule],
  providers : [ AcademyService ],
  controllers : [ AcademyController ],
})
export class AcademyModule {};