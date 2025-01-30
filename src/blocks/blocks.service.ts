import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';
import { BlockParserService } from 'src/common/parsers/block-parser.service';
import { block } from '@prisma/client';
@Injectable()
export class BlocksService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
    private blockParser: BlockParserService,
  ) {}

  async getBlocks(page_data: number, take_data: number) {
    let count = 100000;
    if (page_data >= 2000) {
      count = await this.prisma.transaction.count();
    }

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const value = await this.prisma.block.findMany({
      take: pagination.take,
      skip: pagination.skip,
      orderBy: {
        number: 'desc',
      },
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
    const formatData = this.blockParser.formatBlock(value as block[]);
    return {
      pagination,
      data: formatData,
    };
  }

  async getBlock(block: number | string) {
    const isNumber = typeof block === 'number';

    const blockQuery = this.prisma.block.findFirst({
      where: isNumber ? { number: block } : { hash: block },
    });

    const [blockResponse, navigation] = await Promise.all([
      blockQuery,
      this.getNavigationBlocks(block),
    ]);

    if (!blockResponse) {
      throw new Error(`Block number ${block} not found`);
    }
    const blocks = [blockResponse, navigation.block];

    const formatData = this.blockParser.formatBlock(blocks as block[]);
    delete navigation.block;
    return {
      data: formatData[0],
      navigation,
    };
  }

  async getNavigationBlocks(block: number | string) {
    let blockNumber: number;

    if (typeof block === 'number') {
      blockNumber = block;
    } else {
      const data = await this.prisma.block.findFirst({
        where: { hash: block },
        select: {
          number: true,
        },
      });

      if (!data) {
        throw new Error(`Block with hash ${block} not found`);
      }

      blockNumber = data.number;
    }

    const [prev, next] = await Promise.all([
      this.prisma.block.findFirst({
        where: { number: blockNumber - 1 },
        select: { number: true, timestamp: true },
      }),
      this.prisma.block.findFirst({
        where: { number: blockNumber + 1 },
        select: { number: true, timestamp: true },
      }),
    ]);

    return {
      prev: prev ? prev.number : null,
      next: next ? next.number : null,
      block: prev,
    };
  }
}
