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
   * @param {number | null} cursor - The block number to start from (optional).
   * @returns Paginated block data.
   */
  async getBalanceByAddress(
    address: string,
    take: number = TAKE_PAGE_DATA,
    cursor?: number,
  ) {
    try {
      if (!Number.isInteger(take) || take < 1) {
        throw new BadRequestException(
          `Invalid "take" value: ${take}. Must be a positive integer.`,
        );
      }
      if (!isAddress(address) || !address.includes('0x')) {
        throw new BadRequestException(`Invalid address: ${address}`);
      }

      const where = {
        address,
        ...(cursor ? { blockNumber: { lt: cursor } } : {}),
      };
      const balances = await this.prisma.balance.findMany({
        take,
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

      const formatBalance = balances.map((b) => {
        b.timestamp = b.timestamp.toString() as unknown as bigint;
        b.balance = new BigNumber(b.balance)
          .dividedBy(1e18)
          .toNumber()
          .toString();
        return b;
      });

      const nextCursor =
        formatBalance.length > 0
          ? formatBalance[formatBalance.length - 1].blockNumber
          : null;

      return {
        pagination: {
          nextCursor,
          take,
        },
        data: formatBalance,
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
