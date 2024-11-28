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

    const { skip, take, totalPages, currentPage } = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const value = await this.prisma.block.findMany({
      take,
      skip,
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
      delete v.timestamp;
      return v;
    });

    return {
      totalPages,
      currentPage,
      total: count,
      data: response,
    };
  }

  async getBlock(block: number) {
    const response = await this.prisma.block.findFirst({
      where: {
        number: block,
      },
    });
    delete response.timestamp;
    delete response.received;
    return response;
  }

  async getTxsByBlock(
    blockNumber: number,
    page_data: number,
    take_data: number,
  ) {
    const where: any = {};
    if (blockNumber) where.blockNumber = blockNumber;
    const count = await this.prisma.transaction.count({ where });

    const { skip, take, totalPages, currentPage } = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.transaction.findMany({
      take,
      skip,
      where,
    });

    const response = data.map((v) => {
      delete v.timestamp;
      v.receipt = JSON.parse(v.receipt);
      return v;
    });

    return {
      totalPages,
      currentPage,
      total: count,
      data: response,
    };
  }

  async getInternalTxsByBlock(
    blockNumber: number,
    page_data: number,
    take_data: number,
  ) {
    const where: any = {};
    if (blockNumber) where.blockNumber = blockNumber;

    const count = await this.prisma.internal_transaction.count({ where });

    const { skip, take, totalPages, currentPage } = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.internal_transaction.findMany({
      take,
      skip,
      where,
    });

    const response = data.map((v) => {
      delete v.timestamp;
      return v;
    });

    return {
      totalPages,
      currentPage,
      total: count,
      data: response,
    };
  }
}
