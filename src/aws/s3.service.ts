import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private s3: S3;
  private bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadRecordFile( localFilePath: string, s3Key: string ) {
    const fileContent = fs.readFileSync(localFilePath);

    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'application/json',
    };

    const result = await this.s3.upload(params).promise();
    return result.Location; // S3 URL 반환
  }

  async getJsonFile( s3Key: string ): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
    };

    try
    {
      const data = await this.s3.getObject(params).promise();
      if(!data.Body)
      {
        throw new Error('S3 파일이 비어있습니다.');
      }

      const jsonString = data.Body.toString('utf-8'); // Buffer → 문자열
      return JSON.parse(jsonString);
    }
    catch(error)
    {
      console.error('S3 JSON 읽기 실패:', error);
      throw error;
    }
  }
}
