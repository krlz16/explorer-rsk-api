import { BadRequestException, Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async getAccountsByToken(
    tokenAddress: string,
    take: number,
    cursor?: string,
  ) {
    try {
      if (take < 0 && !cursor) {
        throw new BadRequestException(
          'Cannot paginate backward without a cursor.',
        );
      }

      const parsedCursor = this.decodeCursor(cursor);

      const tokensWithDetails = await this.prisma.token_address.findMany({
        take: take > 0 ? take + 1 : take - 1,
        cursor: cursor
          ? {
              address_contract_blockNumber: {
                ...parsedCursor,
                contract: tokenAddress,
              },
            }
          : undefined,
        skip: cursor ? 1 : undefined,
        where: { contract: tokenAddress },
        orderBy: [
          { address: 'asc' },
          { blockNumber: take > 0 ? 'desc' : 'asc' },
        ],
        include: {
          contract_token_address_contractTocontract: {
            select: {
              name: true,
            },
          },
          contract_details: {
            select: {
              symbol: true,
              decimals: true,
            },
          },
        },
        distinct: ['address'],
      });

      const hasMoreData = tokensWithDetails.length > Math.abs(take);

      const paginatedResults = hasMoreData
        ? take > 0
          ? tokensWithDetails.slice(0, Math.abs(take))
          : tokensWithDetails.slice(1)
        : tokensWithDetails;

      const formattedData = paginatedResults.map((token) => ({
        address: token.address,
        contract: token.contract,
        blockNumber: token.blockNumber,
        blockHash: token.blockHash,
        balance: token.balance
          ? new BigNumber(token.balance)
              .dividedBy(10 ** (token.contract_details?.decimals || 18))
              .toString()
          : '0',
        name:
          token.contract_token_address_contractTocontract?.name ||
          '(Not provided)',
        symbol: token.contract_details?.symbol || '(Not provided)',
        decimals: token.contract_details?.decimals || 18,
      }));

      const nextCursor =
        take > 0 && !hasMoreData
          ? null
          : this.encodeCursor(
              paginatedResults[paginatedResults.length - 1].address,
              paginatedResults[paginatedResults.length - 1].blockNumber,
            );

      const prevCursor =
        !cursor || (take < 0 && !hasMoreData)
          ? null
          : this.encodeCursor(
              paginatedResults[0].address,
              paginatedResults[0].blockNumber,
            );

      return {
        paginationData: { nextCursor, prevCursor, take, hasMoreData },
        data: formattedData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch tokens: ${error.message}`);
    }
  }

  encodeCursor = (address: string, blockNumber: number) =>
    `${address}_${blockNumber}`;

  decodeCursor = (cursor?: string) => {
    if (!cursor) return undefined;
    const [address, blockNumber] = cursor.split('_');
    return { address, blockNumber: parseInt(blockNumber, 10) };
  };
}
