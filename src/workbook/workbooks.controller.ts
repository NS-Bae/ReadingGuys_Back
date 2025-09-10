import { Controller, Query, Get, Res, Body, Post, BadRequestException, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from "multer";

import { WorkbookService } from './workbooks.service';
import { UploadBookDto } from '../dto/uploadWorkbook.dto';
import { DeleteCheckedDto } from '../dto/multiChecked.dto';
import { UpdateBookPaidDto } from 'src/dto/updateWorkbookPaid.dto';
import { multerConfig } from './multer.config';

@Controller('workbook')
export class WorkbookController {
  constructor(
    private readonly workbookService: WorkbookService,
  ) {}

  @Get('list')
  async getWorkbookList(@Query('academyId') academyId: string)
  {
    const workbooks = await this.workbookService.getWorkbookList(academyId);
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
  async downloadBook(@Body('storageLink') storageLink : string, @Res() res : Response)
  {
    if(!storageLink)
    {
      throw new BadRequestException('파일경로가 존재하지 않습니다.');
    }
    const bookLink = await this.workbookService.getWorkbookDownload(storageLink);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(storageLink)}"`);
    res.sendFile(bookLink);
  }
  //책 업로드
  @Post('adddata')
  @UseInterceptors(FileInterceptor("file", multerConfig))
  async uploadBook(
    @Body() data: UploadBookDto,
    @UploadedFile() file: Multer.File
    )
  {
    return this.workbookService.uploadWorkbookFile(data, file);
  }
  //책 삭제
  @Delete('deletedata')
  async deleteBook(@Body() deleteCheckedRow: DeleteCheckedDto)
  {
    return this.workbookService.deleteWorkbook(deleteCheckedRow);
  }
  //책 변경(유료 무료)
  @Post('changedata')
  async updateBook(@Body() updateCheckedRow: UpdateBookPaidDto)
  {
    return this.workbookService.updateWorkbookPaid(updateCheckedRow);
  }
}