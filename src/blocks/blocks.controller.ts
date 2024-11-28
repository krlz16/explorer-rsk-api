import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';

export interface PaginationData {
  block_number: number;
  page_data?: number;
  take_data?: number;
}

export class GenericQueryDto<T> {
  data: T;
}

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

  @Get(':block')
  getBlock(@Param('block') block: number) {
    return this.blockService.getBlock(block);
  }

  @Get('/txs/:block_number')
  getTxByBlock(
    @Param('block_number') block_number: number,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.blockService.getTxsByBlock(block_number, page_data, take_data);
  }

  @Get('/itxs/:block_number')
  getInternalTxByBlock(
    @Param('block_number') block_number: number,
    @Query('page_data') page_data: number,
    @Query('take_data') take_data: number,
  ) {
    return this.blockService.getInternalTxsByBlock(
      block_number,
      page_data,
      take_data,
    );
  }
}
