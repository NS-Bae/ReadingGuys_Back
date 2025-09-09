import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { EventLogs } from "./eventlogs.entity";

@Injectable()
export class EventLogsService
{
  private readonly logger = new Logger(EventLogsService.name);

  constructor(
    @InjectRepository(EventLogs)
    private eventLogsRepository: Repository<EventLogs>,
    private dataSource: DataSource,
  ) {}

  
}