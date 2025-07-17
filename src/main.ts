import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from 'ormconfig';

async function bootstrap() {
  await AppDataSource.initialize(); 
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
