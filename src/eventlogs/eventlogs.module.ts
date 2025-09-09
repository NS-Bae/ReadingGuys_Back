import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventLogs } from "./eventlogs.entity";
import { EventLogsService } from "./eventlogs.service";
import { EventLogsController } from "./eventlogs.controller";


@Module({
  imports: [TypeOrmModule.forFeature([EventLogs])],
  controllers: [EventLogsController],
  providers: [EventLogsService],
  exports: [EventLogsService],
})

export class EventLogsModule {}