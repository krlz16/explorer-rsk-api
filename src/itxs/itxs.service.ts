import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ItxsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getInternalTxById(itxId: string) {
    const itx = await this.prisma.internal_transaction.findFirst({
      where: {
        internalTxId: itxId,
      },
      orderBy: {
        internalTxId: 'desc',
      },
    });
    itx.timestamp = itx.timestamp.toString() as unknown as bigint;
    itx.result = JSON.parse(itx.result);
    itx.action = JSON.parse(itx.action);
    return {
      data: itx,
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

    const formatData = response.map((tx) => {
      tx.action = JSON.parse(tx.action);
      return tx;
    });

    return {
      pagination,
      data: formatData,
    };
  }

  async getIinternalTxsByTxHash(
    hash: string,
    page_data: number,
    take_data: number,
  ) {
    const where: any = {};
    if (hash) where.transactionHash = hash;

    const count = await this.prisma.internal_transaction.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const response = await this.prisma.internal_transaction.findMany({
      where: {
        transactionHash: hash,
      },
      orderBy: {
        internalTxId: 'desc',
      },
    });

    const formatData = response.map((tx) => {
      tx.timestamp = tx.timestamp.toString() as unknown as bigint;
      tx.action = JSON.parse(tx.action);
      return tx;
    });
    return {
      pagination,
      data: formatData,
    };
  }

  async getInternalTxsByAddress(
    address: string,
    page_data: number,
    take_data: number,
  ) {
    const where = {
      address,
    };
    const count = await this.prisma.address_in_itx.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });
    const response = await this.prisma.address_in_itx.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
      include: {
        internal_transaction: true,
      },
      orderBy: {
        internalTxId: 'desc',
      },
    });

    const formatData = response.map((tx) => {
      const { internal_transaction, ...result } = tx;
      internal_transaction.timestamp =
        internal_transaction.timestamp.toString() as unknown as bigint;

      internal_transaction.action = JSON.parse(internal_transaction.action);
      return {
        ...result,
        ...internal_transaction,
      };
    });
    console.log('formatData: ', formatData);
    return {
      pagination,
      data: formatData,
    };
  }
}
