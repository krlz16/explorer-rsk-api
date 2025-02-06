import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { TokenParserService } from 'src/common/parsers/token-parser.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
    private tokenParser: TokenParserService,
  ) {}

  async getTokens(page_data: number, take_data: number) {
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
    const count = await this.prisma.address.count({ where });
    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const response = await this.prisma.address.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
      select: {
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

    const formattedData = this.tokenParser.formatTokens(response);

    return {
      pagination,
      data: formattedData,
    };
  }

  async getTokenByAddress(tokeAddress: string) {
    const response = await this.prisma.token_address.findFirst({
      where: {
        address: tokeAddress,
      },
    });
    return {
      data: response,
    };
  }

  async getTokenByNameOrSymbol(value: string) {
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

    console.log('response: ', response);
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
  }
}
