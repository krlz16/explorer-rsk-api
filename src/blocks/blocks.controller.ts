import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { PaginationTakeValidationPipe } from 'src/common/pipes/pagination-take.pipe';
import { PaginationCursorValidationPipe } from 'src/common/pipes/pagination-cursor.pipe';
import { BlockIdentifierPipe } from 'src/common/pipes/block-identifier.pipe';

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
  getBlocks(
    @Query('take', PaginationTakeValidationPipe) take?: number,
    @Query('cursor', PaginationCursorValidationPipe) cursor?: number,
  ) {
    return this.blockService.getBlocks(take, cursor);
  }

  /**
   * Fetch a specific block by its number or hash.
   * @param {string} blockOrHash - Block number or hash.
   * @returns Block details.
   */
  @Get(':blockOrHash')
  getBlock(@Param('blockOrHash', BlockIdentifierPipe) blockOrHash: string) {
    return this.blockService.getBlock(blockOrHash);
  }
}
