import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TermsAgreementService } from "./agreement.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";

import { CurrentUser } from "src/auth/decorators/currentUser.decorator";
import { multerConfig } from "src/utils/multer.config";

@Controller('agreement')
export class TermsAgreementController
{
  constructor(
    private readonly termsAgreementService: TermsAgreementService
  ) {}

  @Post('adddata')
  @UseInterceptors(FileInterceptor("file", multerConfig))
  async uploadTerms(
    @CurrentUser('hashedUserId') hashedData: string, 
    @Req() req: any,
    @Body() data: any,
    @UploadedFile() file: Multer.File
    )
  {
    return this.termsAgreementService.uploadNewTermsFile(data, hashedData, file);
  }

  @Get('latest')
  async getLatestTerms(data: any)
  {
    return this.termsAgreementService.getLatestTerm(data);
  }

  @Post('agree_terms')
  async agreementToTerms(data: any)
  {
    return this.termsAgreementService.agreeTerm(data);
  }
}