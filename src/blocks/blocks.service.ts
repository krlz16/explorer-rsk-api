import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BlockParserService } from 'src/common/parsers/block-parser.service';
import { block } from '@prisma/client';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Injectable()
export class BlocksService {
  private readonly logger = new Logger(BlocksService.name);

  constructor(
    private prisma: PrismaService,
    private blockParser: BlockParserService,
  ) {}

  /**
   * Fetch paginated blocks using keyset pagination.
   * @param {number} take - Number of blocks to retrieve.
   * @param {number | null} cursor - The block number to start from (optional).
   * @returns Paginated block data.
   */
  async getBlocks(take: number = TAKE_PAGE_DATA, cursor?: number) {
    try {
      if (take < 0 && !cursor) {
        throw new BadRequestException(
          'Cannot paginate backward without a cursor.',
        );
      }

      const blocks = await this.prisma.block.findMany({
        take: take > 0 ? take + 2 : take - 2,
        cursor: cursor ? { number: cursor } : undefined,
        skip: cursor ? (take > 0 ? 1 : 0) : take < 0 ? 1 : undefined,
        orderBy: { number: 'desc' },
        select: {
          id: true,
          number: true,
          transactions: true,
          hash: true,
          miner: true,
          size: true,
          timestamp: true,
          difficulty: true,
          totalDifficulty: true,
          uncles: true,
        },
      });

      if (blocks.length === 0) {
        return {
          paginationData: {
            nextCursor: null,
            prevCursor: cursor || null,
            take,
          },
          data: [],
        };
      }

      const hasMoreData = blocks.length > Math.abs(take);

      const paginatedBlocks = hasMoreData
        ? take > 0
          ? blocks.slice(0, Math.abs(take) + 1)
          : blocks.slice(1)
        : blocks;

      const formattedBlocks = this.blockParser.formatBlock(
        paginatedBlocks as block[],
      );

      const nextCursor =
        take > 0 && !hasMoreData
          ? null
          : formattedBlocks[formattedBlocks.length - 1]?.number;

      const prevCursor =
        !cursor || (take < 0 && !hasMoreData)
          ? null
          : formattedBlocks[0]?.number;

      return {
        paginationData: {
          nextCursor,
          prevCursor,
          hasMoreData,
          take,
        },
        data: formattedBlocks,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch blocks: ${error.message}`);
    }
  }

  /**
   * Fetch a specific block by number or hash.
   * @param {number | string} block - Block number or hash.
   * @returns Block details.
   */
  async getBlock(block: number | string) {
    try {
      const blockResponse = await this.prisma.block.findFirst({
        where: typeof block === 'number' ? { number: block } : { hash: block },
      });

      if (!blockResponse) {
        return { data: null };
      }

      const prevBlock = await this.prisma.block.findFirst({
        where: { number: blockResponse.number - 1 },
        select: { number: true, timestamp: true },
      });

      const navigation = {
        prev: prevBlock ? prevBlock.number : null,
        next: blockResponse.number + 1,
      };

      const formattedData = this.blockParser.formatBlock(
        prevBlock
          ? ([blockResponse, prevBlock] as block[])
          : ([blockResponse] as block[]),
      );

      return {
        data: formattedData[0],
        navigation,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error.code === 'P2023') {
        throw new BadRequestException(
          `Invalid query parameter for block: ${block}`,
        );
      }

      throw new Error(`Failed to fetch block: ${error.message}`);
    }
  }
}
