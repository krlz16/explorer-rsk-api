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

  @Get(':id')
  getAddress(@Param('id') id: string) {
    console.log('address: ', id);
    return this.addressService.getAddress(id);
  }
}
