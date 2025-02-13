import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
@Controller('verifications')
export class VerificationsController {
  constructor(private verificationsService: VerificationsService) {}

  @Get('getEvmVersions')
  getEvmVersions() {
    return this.verificationsService.getEvmVersions();
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  async verify(@UploadedFile() file: Multer.File, @Body('data') data: string) {
    try {
      return this.verificationsService.verify(data, file);
    } catch (error) {
      throw new Error(`Invalid FormData format ${error}`);
    }
  }
}
