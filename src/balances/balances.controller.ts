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
import { TakeValidationPipe } from 'src/common/pipes/take-validation.pipe';
import { CursorValidationPipe } from 'src/common/pipes/cursor-validation.pipe';

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
  @UsePipes(new ValidationPipe({ transform: true }))
  getBalanceByAddress(
    @Param('address', AddressValidationPipe) address: string,
    @Query('take', TakeValidationPipe) take?: number,
    @Query('cursor', CursorValidationPipe) cursor?: number,
  ) {
    return this.balanceService.getBalanceByAddress(address, take, cursor);
  }
}
