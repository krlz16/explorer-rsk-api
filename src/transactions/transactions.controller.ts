import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('txs')
export class TransactionsController {
  constructor(private txsService: TransactionsService) {}

  @Get()
  getTxs(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.txsService.getTxs(page_data, take_data);
  }

  @Get(':hash')
  getTx(@Param('hash') hash: string) {
    return this.txsService.getTx(hash);
  }

  @Get('/itxs/:hash')
  getInternalTxByBlock(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
    @Param('hash') hash: string,
  ) {
    return this.txsService.getIinternalTxsByTxHash(hash, page_data, take_data);
  }
}
