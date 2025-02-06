import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { TAKE_PAGE_DATA } from 'src/common/constants';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { TxParserService } from 'src/common/parsers/transaction-parser.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
    private txParser: TxParserService,
  ) {}

  async getTxs(page_data: number, take_data: number) {
    let count = 100000;
    console.log('page_data: ', page_data);
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
      tx.value = '0';
      return tx;
    });

    return {
      pagination,
      data: response,
    };
  }

  async getLast24HoursTransactions() {
    const now = Math.floor(Date.now() / 1000);
    const last24Hours = now - 24 * 60 * 60;

    const count = await this.prisma.transaction.count({
      where: {
        timestamp: {
          gte: last24Hours,
          lte: now,
        },
      },
    });

    return {
      data: {
        count,
      },
    };
  }

  async getTx(hash: string) {
    const response = await this.prisma.transaction.findFirst({
      where: {
        hash,
      },
      orderBy: {
        txId: 'desc',
      },
    });

    if (!response) {
      const resp = await this.getPendingTxByHash(hash);
      return {
        data: resp.data,
      };
    }

    const tx = this.txParser.formatTx(response);

    return {
      data: tx,
    };
  }

  async getTxsByBlock(
    blockOrhash: number | string,
    page_data: number,
    take_data: number,
  ) {
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

  async getPendingTransactions() {
    const currentTime = Math.floor(Date.now() / 1000).toString();
    const twentyFourHoursAgo = (Number(currentTime) - 30 * 60).toString();

    const response = await this.prisma.transaction_pending.findMany({
      take: TAKE_PAGE_DATA,
      where: {
        status: 'PENDING',
        timestamp: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        blockNumber: 'desc',
      },
    });

    const formatData = response?.map((tx) => {
      tx.timestamp = Math.round(Number(tx.timestamp) * 1000).toString();
      return tx;
    });
    return {
      data: formatData,
    };
  }

  async getPendingTxByHash(hash: string) {
    const response = await this.prisma.transaction_pending.findFirst({
      where: {
        hash,
      },
    });

    if (!response) {
      return {
        data: null,
      };
    }
    response.timestamp = Math.round(
      Number(response.timestamp) * 1000,
    ).toString();

    response.value = new BigNumber(response.value.toString())
      .dividedBy(1e18)
      .toNumber()
      .toString();

    return {
      data: response,
    };
  }
}
