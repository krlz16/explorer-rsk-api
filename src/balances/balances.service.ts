import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetch paginated balances using keyset pagination.
   * @param {string} address - The address to fetch balances for.
   * @param {number} take - Number of blocks to retrieve.
   * @param {number} cursor - The block number to start from (optional).
   * @returns Paginated balances data for an address.
   */
  async getBalanceByAddress(address: string, take: number, cursor?: number) {
    try {
      if (take < 0 && !cursor) {
        throw new BadRequestException(
          'Cannot paginate backward without a cursor.',
        );
      }

      const response = await this.prisma.balance.findMany({
        take: take > 0 ? take + 1 : take - 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : undefined,
        where: { address },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          blockNumber: true,
          timestamp: true,
          balance: true,
        },
      });

      if (response.length <= 0) {
        return {
          paginationBalances: {
            nextCursor: null,
            prevCursor: cursor || null,
            take,
            hasMoreData: false,
          },
          data: [],
        };
      }

      const hasMoreData = response.length > Math.abs(take);

      const paginatedBalances = hasMoreData
        ? take > 0
          ? response.slice(0, Math.abs(take))
          : response.slice(1)
        : response;

      const formattedData = paginatedBalances.map((b) => {
        return {
          id: b.id.toString(),
          blockNumber: b.blockNumber,
          timestamp: b.timestamp.toString(),
          balance: new BigNumber(b.balance).dividedBy(1e18).toString(),
        };
      });

      const nextCursor =
        take > 0 && !hasMoreData
          ? null
          : formattedData[formattedData.length - 1]?.id;

      const prevCursor =
        !cursor || (take < 0 && !hasMoreData) ? null : formattedData[0]?.id;

      return {
        paginationBalances: {
          nextCursor,
          prevCursor,
          take,
          hasMoreData,
        },
        data: formattedData,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(`Failed to fetch balances by address: ${error.message}`);
    }
  }
}
