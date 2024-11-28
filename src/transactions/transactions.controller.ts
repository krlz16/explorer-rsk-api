import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
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
}
