import { Controller, Get, Param, Query } from '@nestjs/common';
import { ItxsService } from './itxs.service';
import { ParseBlockOrHashPipe } from 'src/common/pipes/parseBlockOrHashPipe.pipe';

@Controller('itxs')
export class ItxsController {
  constructor(private itxsService: ItxsService) {}

  @Get(':id')
  getInternalTxById(@Param('id') id: string) {
    return this.itxsService.getInternalTxById(id);
  }

  @Get('/block/:blockOrhash')
  getInternalTxByBlock(
    @Param('blockOrhash', ParseBlockOrHashPipe) blockOrhash: string,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.itxsService.getInternalTxsByBlock(
      blockOrhash,
      page_data,
      take_data,
    );
  }

  @Get('/tx/:hash')
  getIinternalTxsByTxHash(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
    @Param('hash') hash: string,
  ) {
    return this.itxsService.getIinternalTxsByTxHash(hash, page_data, take_data);
  }

  @Get('/address/:address')
  getInternalTxsByAddress(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
    @Param('address') address: string,
  ) {
    return this.itxsService.getInternalTxsByAddress(
      address,
      page_data,
      take_data,
    );
  }
}
