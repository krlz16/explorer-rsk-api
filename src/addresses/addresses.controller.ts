import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private addressService: AddressesService) {}

  @Get()
  getAllAddresses(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.addressService.getAddresses(page_data, Number(take_data));
  }

  @Get(':address')
  getAddress(@Param('address') address: string) {
    console.log('address: ', address);
    return this.addressService.getAddress(address);
  }
}
