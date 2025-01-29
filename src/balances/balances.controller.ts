import { Controller, Get, Param, Query } from '@nestjs/common';
import { BalancesService } from './balances.service';

@Controller('balances')
export class BalancesController {
  constructor(private balanceService: BalancesService) {}

  @Get('/address/:address')
  getAllAddresses(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
    @Param('address') address: string,
  ) {
    return this.balanceService.getBalanceByAddress(
      address,
      page_data,
      take_data,
    );
  }
}
