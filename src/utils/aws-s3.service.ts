import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { Multer } from "multer";

@Injectable()
export class AwsS3Service {
  private s3: S3;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>("AWS_S3_ACCESS_KEY"),
      secretAccessKey: this.configService.get<string>("AWS_S3_SECRET_KEY"),
      region: this.configService.get<string>("AWS_S3_REGION"),
      endpoint: this.configService.get<string>("AWS_S3_ENDPOINT"),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME");
  }

  async uploadFile(file: Multer.File, tag: string): Promise<string> {
    const conversionName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: `${tag}/${Date.now()}-${conversionName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(uploadParams).promise();

    return result.Key;
  }

  async uploadRecord(data: any, key: string): Promise<string> {
    const convertData = JSON.stringify(data, null, 2);

    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: convertData,
      ContentType: 'application/json; charset=utf-8',
    };

    const result = await this.s3.upload(uploadParams).promise();

    return result.Key;
  }

  async getSignedDownloadUrl(key: string)
  {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: 60,
    });
  }

  async deleteFile(key: string): Promise<void>
  {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: key,
    })
    .promise();
  }
}
