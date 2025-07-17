import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { Multer } from "multer";

@Injectable()
export class AwsS3Service {
  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get<string>("AWS_REGION"),
    });
  }

  async uploadFile(file: Multer.File): Promise<string> {
    const uploadParams: S3.PutObjectRequest = {
      Bucket: this.configService.get<string>("AWS_S3_BUCKET_NAME"),
      Key: `workbooks/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(uploadParams).promise();
    return result.Location; // 업로드된 파일의 URL 반환
  }
}
