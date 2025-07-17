import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto } from './auth/dto/login.dto';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
