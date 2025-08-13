import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as path from 'path';
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

  async uploadRecordFile(localFilePath: string, s3Key: string) {
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
}
