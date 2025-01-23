import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getTokens(page_data: number, take_data: number) {
    const count = await this.prisma.token_address.count();
    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.token_address.findMany({
      take: pagination.take,
      skip: pagination.skip,
      include: {
        address_token_address_addressToaddress: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        blockNumber: 'desc',
      },
    });

    const formattedData = data.map((item) => ({
      ...item,
      addressInfo: item.address_token_address_addressToaddress,
    }));

    return {
      pagination,
      data: formattedData,
    };
  }

  async getTokenByAddress(tokeAddress: string) {
    console.log('tokeAddress: ', tokeAddress);
    const response = await this.prisma.token_address.findFirst({
      where: {
        address: tokeAddress,
      },
    });

    console.log('response: ', response);
    return {
      data: response,
    };
  }
}
