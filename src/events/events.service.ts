import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getEventsByAddress(
    address: string,
    page_data: number,
    take_data: number,
  ) {
    const where = {
      address_in_event: {
        some: {
          address,
        },
      },
    };
    const count = await this.prisma.event.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });
    const response = await this.prisma.event.findMany({
      take: pagination.take,
      skip: pagination.skip,
      where,
      include: {
        address_in_event: {
          select: {
            address: true,
            isEventEmitterAddress: true,
          },
        },
      },
      orderBy: {
        eventId: 'desc',
      },
    });

    const formatData = response.map((e) => {
      e.timestamp = e.timestamp.toString() as unknown as bigint;
      e.abi = JSON.parse(e.abi);
      e.args = JSON.parse(e.args);
      return e;
    });

    console.log('response: ', response);
    return {
      data: formatData,
      pagination,
    };
  }
}
