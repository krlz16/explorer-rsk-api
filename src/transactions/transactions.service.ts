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
    console.log('getTxs: ');
    console.time('countQuery');

    let count = 100000;
    console.log('page_data: ', page_data);
    if (page_data >= 2000) {
      count = await this.prisma.transaction.count();
    }

    console.timeEnd('countQuery');

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    console.time('transaction');
    console.log('pagination.take: ', pagination.skip);
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
      },
      orderBy: [
        {
          txId: 'desc',
        },
      ],
    });
    console.timeEnd('transaction');
    console.time('response');
    const response = data.map((tx) => {
      tx.timestamp = tx.timestamp.toString() as unknown as bigint;
      return tx;
    });
    console.timeEnd('response');

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
    console.log('data: ', data);
    data.timestamp = data.timestamp.toString() as unknown as bigint;
    data.receipt = JSON.parse(data.receipt);

    return {
      data,
    };
  }

  async getIinternalTxsByTxHash(
    hash: string,
    page_data: number,
    take_data: number,
  ) {
    console.log('hash: ==', hash);

    const where: any = {};
    if (hash) where.transactionHash = hash;
    console.log('where: ', where);

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
      const { action, ...result } = tx;
      result.timestamp = result.timestamp.toString() as unknown as bigint;
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
