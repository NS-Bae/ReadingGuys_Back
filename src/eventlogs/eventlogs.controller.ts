import { Controller } from "@nestjs/common";
import { EventLogsService } from "./eventlogs.service";

@Controller('logs')
export class EventLogsController
{
  constructor(
    private readonly eventLogsService: EventLogsService
  ) {}
}