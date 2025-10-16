import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { EventLogs } from "./eventlogs.entity";
import { encryptAES256GCM, hashSHA256 } from "src/utils/encryption.service";

import { LogDto } from "../dto/log.dto";
import { EventType } from "src/others/other.types";

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

    const translateEvent = EventType[log.data4 as keyof typeof EventType];

    const encryptedDevice = encryptAES256GCM(log.data2);
    const encryptedIp = encryptAES256GCM(log.data3);

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
          eventType: translateEvent,
          encryptedDeviceInfo: Buffer.from(encryptedDevice.encryptedData, 'hex'),
          ivDeviceInfo: Buffer.from(encryptedDevice.iv, 'hex'),
          authTagDeviceInfo: Buffer.from(encryptedDevice.authTag, 'hex'),
          encryptedIPAdress: Buffer.from(encryptedIp.encryptedData, 'hex'),
          ivIPAdress: Buffer.from(encryptedIp.iv, 'hex'),
          authTagIPAdress: Buffer.from(encryptedIp.authTag, 'hex'),
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