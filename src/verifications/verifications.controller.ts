import { Controller, Get } from '@nestjs/common';
import { VerificationsService } from './verifications.service';

@Controller('verifications')
export class VerificationsController {
  constructor(private verificationsService: VerificationsService) {}

  @Get('getEvmVersions')
  getEvmVersions() {
    return this.verificationsService.getEvmVersions();
  }
}
