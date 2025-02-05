import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { ParseBlockOrHashPipe } from 'src/common/pipes/parseBlockOrHashPipe.pipe';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Controller('blocks')
export class BlocksController {
  constructor(private blockService: BlocksService) {}

  /**
   * Fetch a paginated list of blocks using keyset pagination.
   * @param {number} cursor - The block number to start from (optional).
   * @param {number} take - Number of records to retrieve.
   * @returns Paginated blocks data.
   */
  @Get()
  getBlocks(@Query('take') take?: number, @Query('cursor') cursor?: number) {
    const takeData = take || TAKE_PAGE_DATA;
    return this.blockService.getBlocks(takeData, cursor);
  }

  /**
   * Fetch a specific block by its number or hash.
   * @param {string} blockOrHash - Block number or hash.
   * @returns Block details.
   */
  @Get(':blockOrHash')
  getBlock(@Param('blockOrHash', ParseBlockOrHashPipe) blockOrHash: string) {
    return this.blockService.getBlock(blockOrHash);
  }
}
