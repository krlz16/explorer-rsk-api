import { Controller, Get, Param, Query } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Controller('balances')
export class BalancesController {
  constructor(private balanceService: BalancesService) {}

  @Get('/address/:address')
  getAllAddresses(
    @Param('address') address: string,
    @Query('take') take?: number,
    @Query('cursor') cursor?: number,
  ) {
    const takeData = take || TAKE_PAGE_DATA;
    return this.balanceService.getBalanceByAddress(address, takeData, cursor);
  }
}
