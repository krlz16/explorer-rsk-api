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
      if (!Number.isInteger(take) || take < 1) {
        throw new BadRequestException(
          `Invalid "take" value: ${take}. Must be a positive integer.`,
        );
      }

      const blocks = await this.prisma.block.findMany({
        take: take + 1,
        ...(cursor ? { where: { number: { lt: cursor } } } : {}),
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
          paginationBlocks: {
            nextCursor: null,
            prevCursor: cursor || null,
            take,
          },
          data: [],
        };
      }

      const formattedBlocks = this.blockParser.formatBlock(blocks as block[]);

      const nextCursor = formattedBlocks[formattedBlocks.length - 1].number;
      const prevCursor = formattedBlocks[0].number + take - 1;

      return {
        paginationBlocks: {
          nextCursor: nextCursor || null,
          prevCursor: prevCursor || null,
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
      if (typeof block === 'number') {
        if (!Number.isInteger(block) || block < 0) {
          throw new BadRequestException(
            `Invalid block number: ${block}. Must be a non-negative integer.`,
          );
        }

        if (block > 2147483647) {
          throw new BadRequestException(
            `Block number ${block} exceeds the allowed limit of 2,147,483,647.`,
          );
        }
      } else if (typeof block === 'string') {
        if (!/^0x[a-fA-F0-9]{64}$/.test(block)) {
          throw new BadRequestException(
            `Invalid block hash format: ${block}. Must be a 64-character hex string.`,
          );
        }
      } else {
        throw new BadRequestException(
          `Invalid block identifier: ${block}. Must be a number or a hash.`,
        );
      }

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
