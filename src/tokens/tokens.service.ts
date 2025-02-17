import { BadRequestException, Injectable } from '@nestjs/common';
import { TAKE_PAGE_DATA } from 'src/common/constants';
import { TokenParserService } from 'src/common/parsers/token-parser.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private prisma: PrismaService,
    private tokenParser: TokenParserService,
  ) {}

  async getTokens(take: number, cursor?: number) {
    try {
      if (take < 0 && !cursor) {
        throw new BadRequestException(
          'Cannot paginate backward without a cursor.',
        );
      }

      const where = {
        type: 'contract',
        contract_contract_addressToaddress: {
          contract_interface: {
            some: {
              interface: {
                in: ['ERC20', 'ERC677', 'ERC721'],
              },
            },
          },
        },
      };

      const response = await this.prisma.address.findMany({
        take: take > 0 ? take + 1 : take - 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : undefined,
        where,
        select: {
          id: true,
          address: true,
          name: true,
          type: true,
          contract_contract_addressToaddress: {
            select: {
              symbol: true,
            },
          },
          address_latest_balance_address_latest_balance_addressToaddress: {
            select: {
              balance: true,
              blockNumber: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      const hasMoreData = response.length > Math.abs(take);

      const paginatedTokens = hasMoreData
        ? response.slice(0, Math.abs(take))
        : response;

      const formattedData = this.tokenParser.formatTokens(paginatedTokens);

      const nextCursor =
        take > 0 && !hasMoreData
          ? null
          : formattedData[formattedData.length - 1]?.id;

      const prevCursor =
        !cursor || (take < 0 && !hasMoreData) ? null : formattedData[0]?.id;

      return {
        paginationData: {
          nextCursor,
          prevCursor,
          take,
          hasMoreData,
        },
        data: formattedData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch tokens: ${error.message}`);
    }
  }

  async getTokenByAddress(address: string) {
    try {
      const response = await this.prisma.token_address.findMany({
        take: TAKE_PAGE_DATA,
        where: {
          address: address,
        },
        distinct: ['contract'],
        include: {
          contract_token_address_contractTocontract: {
            select: {
              name: true,
              contract_contract_addressToaddress: {
                select: {
                  symbol: true,
                  contract_interface: true,
                },
              },
            },
          },
        },
        orderBy: {
          blockNumber: 'desc',
        },
      });

      if (!response.length) {
        return {
          data: [],
        };
      }
      const formattedData = this.tokenParser.formatTokensByAddress(response);

      return {
        data: formattedData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch tokens: ${error.message}`);
    }
  }

  async getTokenByNameOrSymbol(value: string) {
    try {
      const response = await this.prisma.address.findMany({
        take: 20,
        where: {
          OR: [
            {
              name: {
                contains: value,
                mode: 'insensitive',
              },
            },
            {
              contract_contract_addressToaddress: {
                symbol: {
                  contains: value,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        select: {
          address: true,
          name: true,
          contract_contract_addressToaddress: {
            select: {
              symbol: true,
            },
          },
        },
      });

      const formatData = response.map((t) => {
        return {
          address: t.address,
          name: t.name,
          symbol: t.contract_contract_addressToaddress.symbol,
        };
      });

      return {
        data: formatData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch tokens: ${error.message}`);
    }
  }
}
