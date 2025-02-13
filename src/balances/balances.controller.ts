import {
  Controller,
  Get,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BalancesService } from './balances.service';
import { AddressValidationPipe } from 'src/common/pipes/address-validation.pipe';
import { PaginationTakeValidationPipe } from 'src/common/pipes/pagination-take.pipe';
import { PaginationCursorValidationPipe } from 'src/common/pipes/pagination-cursor.pipe';

@Controller('balances')
export class BalancesController {
  constructor(private balanceService: BalancesService) {}

  /**
   * Fetch a paginated list of balances using keyset pagination.
   * @param {string} address - The address to fetch balances for.
   * @param {number} take - Number of records to retrieve. Negative values will paginate backwards.
   * @param {number} cursor - The block number to start from (optional).
   * @returns Paginated balances data.
   */
  @Get('/address/:address')
  getBalanceByAddress(
    @Param('address', AddressValidationPipe) address: string,
    @Query('take', PaginationTakeValidationPipe) take?: number,
    @Query('cursor', PaginationCursorValidationPipe) cursor?: number,
  ) {
    return this.balanceService.getBalanceByAddress(address, take, cursor);
  }
}
