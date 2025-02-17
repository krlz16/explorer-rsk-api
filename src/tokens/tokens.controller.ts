import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { AddressValidationPipe } from 'src/common/pipes/address-validation.pipe';
import { BlockIdentifierPipe } from 'src/common/pipes/block-identifier.pipe';

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

  @Get('/address/:address')
  getToken(
    @Param('address', AddressValidationPipe) address: string,
  ) {
    return this.tokensService.getTokenByAddress(address);
  }

  @Get('/search/:value')
  getTokenByNameOrSymbol(@Param('value') value: string) {
    return this.tokensService.getTokenByNameOrSymbol(value);
  }
}
