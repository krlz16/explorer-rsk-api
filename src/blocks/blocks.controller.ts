import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { ParseBlockOrHashPipe } from 'src/common/pipes/parseBlockOrHashPipe.pipe';

@Controller('blocks')
export class BlocksController {
  constructor(private blockService: BlocksService) {}

  @Get()
  getBlocks(
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.blockService.getBlocks(page_data, take_data);
  }

  @Get(':blockOrhash')
  getBlock(@Param('blockOrhash', ParseBlockOrHashPipe) blockOrhash: string) {
    return this.blockService.getBlock(blockOrhash);
  }
}
