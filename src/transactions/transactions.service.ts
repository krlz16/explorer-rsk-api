import { BadRequestException, Injectable } from '@nestjs/common';
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

  /**
   * Fetches paginated transactions using cursor-based pagination.
   * @param {number} take - Number of transactions to retrieve. Negative values paginate backward.
   * @param {string | null} cursor - The transaction ID to start from (optional).
   * @returns Paginated transactions data.
   */
  async getTransactions(take: number, cursor?: string) {
    if (take < 0 && !cursor) {
      throw new BadRequestException(
        'Cannot paginate backward without a cursor.',
      );
    }

    const parsedCursor = this.decodeCursor(cursor);

    const transactions = await this.prisma.transaction.findMany({
      take: take > 0 ? take + 1 : take - 1,
      cursor: cursor
        ? { blockNumber_transactionIndex: parsedCursor }
        : undefined,
      skip: cursor ? 1 : undefined,
      orderBy: [
        { blockNumber: take > 0 ? 'desc' : 'asc' },
        { transactionIndex: 'desc' },
      ],
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
        transactionIndex: true,
      },
    });

    if (transactions.length === 0) {
      return {
        pagination: { nextCursor: null, prevCursor: null, take },
        data: [],
      };
    }

    const hasMoreData = transactions.length > Math.abs(take);

    const paginatedTransactions = hasMoreData
      ? transactions.slice(0, Math.abs(take))
      : transactions;

    const formattedData = this.txParser.formatTxs(paginatedTransactions);

    const nextCursor =
      take > 0 && !hasMoreData
        ? null
        : this.encodeCursor(
            formattedData[formattedData.length - 1]?.blockNumber,
            formattedData[formattedData.length - 1]?.transactionIndex,
          );

    const prevCursor =
      !cursor || (take < 0 && !hasMoreData)
        ? null
        : this.encodeCursor(
            formattedData[0]?.blockNumber,
            formattedData[0]?.transactionIndex,
          );

    return {
      paginationData: {
        nextCursor,
        prevCursor,
        take,
        hasMoreData,
      },
      data: formattedData,
    };
  }

  encodeCursor = (blockNumber: number, transactionIndex: number) =>
    `${blockNumber}_${transactionIndex}`;

  decodeCursor = (cursor?: string) => {
    if (!cursor) return undefined;
    const [blockNumber, transactionIndex] = cursor.split('_');
    return {
      blockNumber: parseInt(blockNumber, 10),
      transactionIndex: parseInt(transactionIndex, 10),
    };
  };

  async getLast24HoursTransactions() {
    const today = new Date();

    const transactionsByDay =
      await this.prisma.bo_number_transactions_daily_aggregated.findFirst({
        where: {
          date1: {
            lte: today,
          },
        },
      });

    return {
      data: {
        date: transactionsByDay.date1,
        count: transactionsByDay.numberOfTransactions,
      },
    };
  }

  /**
   * Retrieves a transaction by its hash.
   *
   * @param {string} hash - The transaction hash to search for.
   * @returns {Promise<{ data: any }>} - Returns the formatted transaction details if found.
   *   - If the transaction is in the database, it returns the formatted transaction.
   *   - If the transaction is not found, it checks pending transactions.
   *   - If the transaction is neither found nor pending, it returns `null`.
   * @throws {Error} If there is a database query failure or unexpected error.
   */
  async getTransactionByHash(hash: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { hash },
      });

      if (!transaction) {
        const pendingTx = await this.getPendingTxByHash(hash);
        return { data: pendingTx?.data ?? null };
      }

      return { data: this.txParser.formatTx(transaction) };
    } catch (error) {
      throw new Error(`Failed to fetch transaction by hash: ${error.message}`);
    }
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

    const response = await this.prisma.transaction.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
    });

    const txs = this.txParser.formatTxs(response);

    return {
      pagination,
      data: txs,
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
