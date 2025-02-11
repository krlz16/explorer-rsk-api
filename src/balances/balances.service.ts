import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { TAKE_PAGE_DATA } from 'src/common/constants';
import { PrismaService } from 'src/prisma.service';
import { isAddress } from '@rsksmart/rsk-utils';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetch paginated balances using keyset pagination.
   * @param {string} address - The address to fetch balances for.
   * @param {number} take - Number of blocks to retrieve.
   * @param {number} cursor - The block number to start from (optional).
   * @returns Paginated block data.
   */
  async getBalanceByAddress(
    address: string,
    take: number = TAKE_PAGE_DATA,
    cursor?: number,
  ) {
    try {
      if (!Number.isInteger(take) || take === 0) {
        throw new BadRequestException(
          `Invalid "take" value: ${take}. Must be a non zero number.`,
        );
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new BadRequestException(`Invalid address: ${address}`);
      }

      const where = {
        address,
      };
      const response = await this.prisma.balance.findMany({
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        where,
        orderBy: {
          id: 'desc',
        },
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
            hasMore: false,
          },
          data: [],
        };
      }

      const formattedData = response.map((b) => {
        return {
          id: b.id.toString(),
          blockNumber: b.blockNumber,
          timestamp: b.timestamp.toString(),
          balance: new BigNumber(b.balance).dividedBy(1e18).toString(),
        };
      });

      const nextCursor = formattedData[formattedData.length - 1].id;
      const prevCursor = formattedData[0].id;
      const hasMore = formattedData.length === take;

      return {
        paginationBalances: {
          nextCursor: nextCursor.toString(),
          prevCursor: prevCursor.toString(),
          take,
          hasMore,
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
