import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { PaginationTakeValidationPipe } from 'src/common/pipes/pagination-take.pipe';
import { PaginationCursorValidationPipe } from 'src/common/pipes/pagination-cursor.pipe';
import { AddressValidationPipe } from 'src/common/pipes/address-validation.pipe';
import { GetTokenByNameOrSymbolParams } from './dto/get-token-by-name-or-symbol.dto';

@Controller('tokens')
export class TokensController {
  constructor(private tokensService: TokensService) {}

  @Get()
  getTokens(
    @Query('take', PaginationTakeValidationPipe) take?: number,
    @Query('cursor', PaginationCursorValidationPipe) cursor?: number,
  ) {
    return this.tokensService.getTokens(take, cursor);
  }

  @Get('/address/:address')
  getToken(
    @Param('address', AddressValidationPipe) address: string,
    @Query('take', PaginationTakeValidationPipe) take?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.tokensService.getTokensByAddress(address, take, cursor);
  }

  @Get('/search/:value')
  getTokenByNameOrSymbol(@Param() params: GetTokenByNameOrSymbolParams) {
    return this.tokensService.getTokenByNameOrSymbol(params.value);
  }
}
