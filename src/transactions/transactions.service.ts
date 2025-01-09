import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getTxs(page_data: number, take_data: number) {
    let count = 100000;
    if (page_data >= 2000) {
      count = await this.prisma.transaction.count();
    }
    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.transaction.findMany({
      take: pagination.take,
      skip: pagination.skip,
      select: {
        hash: true,
        blockNumber: true,
        from: true,
        to: true,
        value: true,
        gasUsed: true,
        timestamp: true,
        txType: true,
        receipt: true,
        date: true,
      },
      orderBy: [
        {
          txId: 'desc',
        },
      ],
    });
    const response = data?.map((tx) => {
      tx.timestamp = tx.timestamp.toString() as unknown as bigint;
      tx.receipt = JSON.parse(tx.receipt);
      return tx;
    });

    return {
      pagination,
      data: response,
    };
  }

  async getTx(hash: string) {
    const data = await this.prisma.transaction.findFirst({
      where: {
        hash,
      },
      orderBy: {
        txId: 'desc',
      },
    });
    data.timestamp = data.timestamp.toString() as unknown as bigint;
    data.receipt = JSON.parse(data.receipt);

    return {
      data,
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

  async getNavigationTx(hash: string) {
    console.log('hash: ', hash);
  }

  async getTxsByAddress(address: string, page_data: number, take_data: number) {
    const where = {
      OR: [
        {
          from: address,
        },
        {
          to: address,
        },
      ],
    };
    const count = await this.prisma.transaction.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });
    const response = await this.prisma.transaction.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
      select: {
        hash: true,
        blockNumber: true,
        from: true,
        to: true,
        value: true,
        gasUsed: true,
        timestamp: true,
        txType: true,
        receipt: true,
      },
      orderBy: {
        txId: 'desc',
      },
    });

    const formatData = response.map((tx) => {
      tx.timestamp = tx.timestamp.toString() as unknown as bigint;
      tx.receipt = JSON.parse(tx.receipt);
      return tx;
    });

    return {
      data: formatData,
    };
  }
}
