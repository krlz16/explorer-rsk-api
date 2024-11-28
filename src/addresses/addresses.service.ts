import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AddressesService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getAddresses(page_data: number, take_data: number) {
    const count = await this.prisma.address.count();

    const { skip, take, totalPages, currentPage } = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const query = {
      take,
      skip,
    };
    const data = await this.prisma.address.findMany(query);

    return {
      totalPages,
      currentPage,
      total: count,
      data,
    };
  }

  async getAddress(address: string) {
    const where = {
      address,
    };
    const count = await this.prisma.address.count({ where });
    console.log('count: ', count);
    const value = await this.prisma.address.findMany({ where });
    return value;
  }
}
