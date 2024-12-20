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
    const count = await this.prisma.block.count();

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
    const formatData = this.blockParser.parseBlock(value as block[]);
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

    const formatData = this.blockParser.parseBlock(blocks as block[]);
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

  async getTxsByBlock(
    blockOrhash: number | string,
    page_data: number,
    take_data: number,
  ) {
    console.log('getTxsByBlock: ');
    const where: any =
      typeof blockOrhash === 'number'
        ? { blockNumber: blockOrhash }
        : { blockHash: blockOrhash };

    const count = await this.prisma.transaction.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.transaction.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
    });

    const response = data.map((v) => {
      v.timestamp = v.timestamp.toString() as unknown as bigint;
      v.receipt = JSON.parse(v.receipt);
      return v;
    });

    return {
      pagination,
      data: response,
    };
  }

  async getInternalTxsByBlock(
    blockOrhash: number | string,
    page_data: number,
    take_data: number,
  ) {
    const where: any =
      typeof blockOrhash === 'number'
        ? { blockNumber: blockOrhash }
        : { blockHash: blockOrhash };

    const count = await this.prisma.internal_transaction.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.internal_transaction.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
      select: {
        type: true,
        timestamp: true,
        action: true,
        internalTxId: true,
      },
      orderBy: {
        internalTxId: 'desc',
      },
    });

    const response = data.map((itx) => {
      itx.timestamp = itx.timestamp.toString() as unknown as bigint;
      return itx;
    });

    const formatData = response.map((b) => {
      const { action, ...result } = b;
      const parseAction = JSON.parse(action);
      return {
        ...parseAction,
        ...result,
      };
    });

    return {
      pagination,
      data: formatData,
    };
  }
}
