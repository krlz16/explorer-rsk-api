import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BalancesService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getBalanceByAddress(
    address: string,
    page_data: number,
    take_data: number,
  ) {
    const where = {
      address,
    };
    const count = await this.prisma.balance.count({ where });
    console.log('count: getBalanceByAddress', count);

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });
    const response = await this.prisma.balance.findMany({
      where,
      orderBy: {
        blockNumber: 'desc',
      },
      select: {
        blockNumber: true,
        timestamp: true,
        balance: true,
      },
    });
    console.log('response: ', response);

    const formatBalance = response.map((b) => {
      b.timestamp = b.timestamp.toString() as unknown as bigint;
      b.balance = new BigNumber(b.balance)
        .dividedBy(1e18)
        .toNumber()
        .toString();
      return b;
    });

    return {
      pagination,
      data: formatBalance,
    };
  }
}
