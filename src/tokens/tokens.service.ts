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
    const { skip, take, totalPages, currentPage } = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.token_address.findMany({
      take,
      skip,
      include: {
        address_token_address_addressToaddress: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      totalPages,
      currentPage,
      total: count,
      data,
    };
  }
}
