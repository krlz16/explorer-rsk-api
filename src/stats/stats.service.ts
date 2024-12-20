import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const stats = await this.prisma.stats.findFirst({
      take: 1,
      orderBy: {
        blockNumber: 'desc',
      },
      select: {
        activeAccounts: true,
        hashrate: true,
        circulatingSupply: true,
        totalSupply: true,
      },
    });
    stats.hashrate = new BigNumber(stats.hashrate)
      .dividedBy(1e6)
      .toNumber() as unknown as string;
    return {
      data: stats,
    };
  }
}
