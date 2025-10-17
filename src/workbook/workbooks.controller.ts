import { Controller, Query, Get, Res, Body, Post, BadRequestException, UseInterceptors, UploadedFile, Delete, Req } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from "multer";

import { WorkbookService } from './workbooks.service';
import { multerConfig } from './multer.config';

import { UploadBookDto } from '../dto/uploadWorkbook.dto';
import { DeleteAcademyCheckedDto } from '../dto/multiChecked.dto';
import { UpdateBookPaidDto } from '../dto/updateWorkbookPaid.dto';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { RawLogInfoDto } from '../dto/log.dto';

@Controller('workbook')
export class WorkbookController {
  constructor(
    private readonly workbookService: WorkbookService,
  ) {}

  @Get('list')
  async getWorkbookList(@CurrentUser('hashedAcademyId') data: string)
  {
    const workbooks = await this.workbookService.getWorkbookList(data);
    return workbooks;
  }

  @Get('totallist')
  async getTotalList()
  {
    const workbooks = await this.workbookService.getWorkbookTotalList();
    return workbooks;
  }
  //책 다운로드
  @Post('download')
  async downloadBook(
    @CurrentUser('hashedUserId') data: string,
    @Body('storageLink') storageLink : string,
    @Req() req: any,
    @Res() res : Response)
  {
    if(!storageLink)
    {
      throw new BadRequestException('파일경로가 존재하지 않습니다.');
    }
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    const bookLink = await this.workbookService.getWorkbookDownload(data, storageLink, rawInfo);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(storageLink)}"`);
    res.sendFile(bookLink);
  }
  //책 업로드
  @Post('adddata')
  @UseInterceptors(FileInterceptor("file", multerConfig))
  async uploadBook(
    @CurrentUser('hashedUserId') hashedData: string, 
    @Req() req: any,
    @Body() data: UploadBookDto,
    @UploadedFile() file: Multer.File
    )
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.workbookService.uploadWorkbookFile(data, hashedData, rawInfo, file);
  }
  //책 삭제
  @Delete('deletedata')
  async deleteBook(
    @CurrentUser('hashedUserId') data: string,
    @Req() req: any,
    @Body() deleteCheckedRow: DeleteAcademyCheckedDto)
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.workbookService.deleteWorkbook(deleteCheckedRow, data, rawInfo);
  }
  //책 변경(유료 무료)
  @Post('changedata')
  async updateBook(
    @CurrentUser('hashedUserId') data: string,
    @Req() req: any,
    @Body() updateCheckedRow: UpdateBookPaidDto)
  {
    const userAgent = req.get('user-agent');
    const rawInfo: RawLogInfoDto = {
      rawInfo: {
        deviceInfo: userAgent,
        IPA: req.clientIp,
      }
    };
    return this.workbookService.updateWorkbookPaid(updateCheckedRow, data, rawInfo);
  }
}