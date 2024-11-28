import { Controller, Get, Query } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private tokensService: TokensService) {}

  @Get()
  getTokens(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.tokensService.getTokens(page_data, take_data);
  }
}
