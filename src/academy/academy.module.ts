import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Academy } from './academy.entity';
import { AcademyService } from './academy.service';
import { AcademyController } from './academy.controller';

@Module({
  imports : [TypeOrmModule.forFeature([ Academy, User ])],
  providers : [ AcademyService ],
  controllers : [ AcademyController ],
})
export class AcademyModule {};