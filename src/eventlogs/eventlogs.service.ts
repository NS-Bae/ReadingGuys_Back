import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { EventLogs } from "./eventlogs.entity";
import { LogDto } from "../dto/log.dto";

@Injectable()
export class EventLogsService
{
  private readonly logger = new Logger(EventLogsService.name);

  constructor(
    @InjectRepository(EventLogs)
    private eventLogsRepository: Repository<EventLogs>,
    private dataSource: DataSource,
  ) {}

  async createBusinessLog(logData: LogDto)
  {
    const { log } = logData;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try
    {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('EventLogs')
        .values({
          hashedUserId: log.data1,
          eventType: log.data8,
          encryptedDeviceInfo: log.data2,
          ivDeviceInfo: log.data3,
          authTagDeviceInfo: log.data4,
          encryptedIPAdress: log.data5,
          ivIPAdress: log.data6,
          authTagIPAdress: log.data7,
          eventTime: new Date(),
        })
        .execute();
      
      await queryRunner.commitTransaction();
    }
    catch(error)
    {
      await queryRunner.rollbackTransaction();
      console.error('로그 등록에 실패했습니다.', error);
    }
    finally
    {
      await queryRunner.release();
    }
  }
}