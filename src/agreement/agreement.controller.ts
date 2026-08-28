import { Body, Controller, Get, Param, ParseEnumPipe, Post, Query, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TermsAgreementService } from "./agreement.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from "multer";

import { CurrentUser } from "../auth/decorators/currentUser.decorator";
import { multerConfig } from "../utils/multer.config";
import { DeviceInfo } from "../auth/decorators/deviceInfo.decorator";

import { RawLogInfoDto } from "../dto/log.dto";
import { TermsAgreementDto, UpdateTermsDto } from "../dto/other.dto";
import { TermsTypes } from "../others/other.types";
import { TermDataParamsDto } from "../dto/readFile.dto";

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

  /* @Get('alllist')
  async getLatestTerms(@Query('main') main: string)
  {
    return this.termsAgreementService.getAllTerms(main);
  } */

  @Post('changedata')
  async updateTerms(
    @Req() req: any,
    @CurrentUser('hashedUserId') hashedData: string,
    @Body() data: UpdateTermsDto
  )
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.termsAgreementService.updateTermsState(data, hashedData, rawInfo);
  }

  @Get('current/:type')
  async getCurrentActiveDocument(@Param('type', new ParseEnumPipe(TermsTypes)) type: TermsTypes): Promise<TermDataParamsDto>
  {
    return this.termsAgreementService.getCurrentActiveDocument(type);
  }

  @Get('required')
  async getRequiredTerms(
    @Req() req: any,
    @CurrentUser('hashedUserId') hashedData: string,
    @DeviceInfo() { deviceInfo },
  )
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.termsAgreementService.findRequiredTerms(hashedData, rawInfo);
  }

  @Post('agree_terms')
  async agreementToTerms(
    @Req() req: any,
    @CurrentUser('hashedUserId') hashedData: string,
    @DeviceInfo() { deviceInfo },
    @Body() data: TermsAgreementDto,
  )
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.termsAgreementService.agreeTerm(hashedData, data.termsType, data.agreed, rawInfo);
  }
}