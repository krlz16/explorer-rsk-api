import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);

  constructor(private addressService: AddressesService) {}

  @Get()
  getAllAddresses(
    @Query('take') take?: number,
    @Query('cursor') cursor?: number,
  ) {
    const takeData = take || TAKE_PAGE_DATA;
    return this.addressService.getAddresses(takeData, cursor);
  }

  @Get(':address')
  getAddress(@Param('address') address: string) {
    this.logger.log(`Fetching address details for ${address}`);
    return this.addressService.getAddress(address);
  }
  @Get('verification/:address')
  getContractVerification(@Param('address') address: string) {
    return this.addressService.getContractVerification(address);
  }
}
