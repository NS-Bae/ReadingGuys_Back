import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일 로드

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any, // 데이터베이스 타입
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
});