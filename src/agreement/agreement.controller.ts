import { Body, Controller, Get, Post, Query, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TermsAgreementService } from "./agreement.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";

import { CurrentUser } from "../auth/decorators/currentUser.decorator";
import { multerConfig } from "../utils/multer.config";
import { DeviceInfo } from "../auth/decorators/deviceInfo.decorator";

import { RawLogInfoDto } from "../dto/log.dto";

@Controller('agreement')
export class TermsAgreementController
{
  constructor(
    private readonly termsAgreementService: TermsAgreementService
  ) {}

  @Post('adddata')
  async uploadTerms(
    @Req() req: any,
    @CurrentUser('hashedUserId') hashedData: string,
    @Body() data: any,
    )
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.termsAgreementService.uploadNewTermsFile(data, hashedData, rawInfo);
  }

  @Get('alllist')
  async getLatestTerms(@Query('main') main: string)
  {
    return this.termsAgreementService.getAllTerms(main);
  }

  @Post('agree_terms')
  async agreementToTerms(data: any)
  {
    return this.termsAgreementService.agreeTerm(data);
  }
}