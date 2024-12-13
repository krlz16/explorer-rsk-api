import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BlocksService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getBlocks(page_data: number, take_data: number) {
    const count = await this.prisma.address.count();

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
      },
    });
    const response = value.map((v) => {
      const timestamp = Number(v.timestamp);
      v.transactions = JSON.parse(v.transactions).length || 0;
      const date = new Date(timestamp * 1000);
      v.timestamp = date.toLocaleString() as unknown as bigint;
      return v;
    });

    return {
      pagination,
      data: response,
    };
  }

  async getBlock(block: number | string) {
    console.log('getBlock: ');
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

    blockResponse.timestamp =
      blockResponse.timestamp.toString() as unknown as bigint;
    blockResponse.received =
      blockResponse.received.toString() as unknown as bigint;
    blockResponse.transactions = JSON.parse(blockResponse.transactions).length;

    return {
      data: blockResponse,
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
        select: { number: true },
      });

      if (!data) {
        throw new Error(`Block with hash ${block} not found`);
      }

      blockNumber = data.number;
    }

    const [prev, next] = await Promise.all([
      this.prisma.block.findFirst({
        where: { number: blockNumber - 1 },
        select: { number: true },
      }),
      this.prisma.block.findFirst({
        where: { number: blockNumber + 1 },
        select: { number: true },
      }),
    ]);

    return {
      prev: prev ? prev.number : null,
      next: next ? next.number : null,
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
      delete v.timestamp;
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

    const response = data.map((v) => {
      delete v.timestamp;
      return v;
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
