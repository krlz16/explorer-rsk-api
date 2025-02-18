import { Controller, Get, Param, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PaginationTakeValidationPipe } from 'src/common/pipes/pagination-take.pipe';
import { AddressValidationPipe } from 'src/common/pipes/address-validation.pipe';

@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get(':address')
  getAccounts(
    @Param('address', AddressValidationPipe) address: string,
    @Query('take', PaginationTakeValidationPipe) take?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.accountsService.getAccountsByToken(address, take, cursor);
  }
}
