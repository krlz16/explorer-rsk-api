import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getTxs(page_data: number, take_data: number) {
    const count = await this.prisma.transaction.count();

    const { skip, take, totalPages, currentPage } = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const query = {
      take,
      skip,
    };
    const data = await this.prisma.transaction.findMany(query);
    console.log('data: ', data);
    const response = data.map((v) => {
      delete v.timestamp;
      return v;
    });

    return {
      totalPages,
      currentPage,
      total: count,
      data: response,
    };
  }

  async getTx(hash: string) {
    const data = await this.prisma.transaction.findFirst({
      where: {
        hash,
      },
    });

    console.log('data: ', data);
    delete data.timestamp;

    return data;
  }
}
