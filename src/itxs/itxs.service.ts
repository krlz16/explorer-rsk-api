import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { TxParserService } from 'src/common/parsers/transaction-parser.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ItxsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
    private txParser: TxParserService,
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
    const result = JSON.parse(itx.result) || {};
    const action = JSON.parse(itx.action);

    const gas = new BigNumber(action.gas.toString(), 16).toNumber().toString();

    const gasUsed = new BigNumber(result?.gasUsed?.toString() || '0', 16)
      .toNumber()
      .toString();

    action.gas = gas;
    action.value = new BigNumber(action.value.toString(), 16)
      .dividedBy(1e18)
      .toNumber()
      .toString();
    result.gasUsed = gasUsed || 0;
    itx.action = action;
    itx.result = result;
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

    const response = await this.prisma.internal_transaction.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
      select: {
        type: true,
        timestamp: true,
        action: true,
        internalTxId: true,
        error: true,
      },
      orderBy: {
        internalTxId: 'desc',
      },
    });

    const formatData = this.txParser.formatItxs(response);

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

    const formatData = this.txParser.formatItxs(response);

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

      const action = JSON.parse(internal_transaction.action);
      action.value = new BigNumber(action.value, 16)
        .dividedBy(1e18)
        .toNumber()
        .toString();
      action.gas = new BigNumber(action.gas.toString(), 16)
        .toNumber()
        .toString();
      internal_transaction.action = action;

      return {
        ...result,
        ...internal_transaction,
      };
    });
    return {
      pagination,
      data: formatData,
    };
  }
}
