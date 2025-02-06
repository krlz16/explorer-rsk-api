import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ParseBlockOrHashPipe } from 'src/common/pipes/parseBlockOrHashPipe.pipe';

@Controller('txs')
export class TransactionsController {
  constructor(private txsService: TransactionsService) {}

  @Get('/')
  getTxs(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.txsService.getTxs(page_data, take_data);
  }

  @Get('/last24hrs')
  getLast24HoursTransactions() {
    return this.txsService.getLast24HoursTransactions();
  }

  @Get('/pending')
  getPendingTransactions() {
    return this.txsService.getPendingTransactions();
  }

  @Get(':hash')
  getTx(@Param('hash') hash: string) {
    return this.txsService.getTx(hash);
  }

  @Get('/block/:blockOrhash')
  getTxByBlock(
    @Param('blockOrhash', ParseBlockOrHashPipe) blockOrhash: string,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.txsService.getTxsByBlock(blockOrhash, page_data, take_data);
  }

  @Get('/address/:address')
  getTxsByAddress(
    @Param('address') address: string,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.txsService.getTxsByAddress(address, page_data, take_data);
  }
}
