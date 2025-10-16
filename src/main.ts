import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from 'ormconfig';
import { IpInterceptor } from './utils/interceptors/ip.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  await AppDataSource.initialize(); 
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new IpInterceptor());
  const port = process.env.PORT || 3000;
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
