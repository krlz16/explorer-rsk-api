import { Injectable } from '@nestjs/common';
import { Prisma, event } from '@prisma/client';
import BigNumber from 'bignumber.js';
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

    return {
      pagination,
      data: formatData,
    };
  }

  async getTransfersEventByTxHash(
    hash: string,
    page_data: number,
    take_data: number,
  ) {
    const where = {
      transactionHash: hash,
      event: {
        contains: 'Transfer',
        mode: 'insensitive' as Prisma.QueryMode,
      },
    };
    const count = await this.prisma.event.count({ where });

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });
    const response = await this.prisma.event.findMany({
      where,
      include: {
        address_event_addressToaddress: {
          select: {
            name: true,
            contract_contract_addressToaddress: {
              select: {
                symbol: true,
              },
            },
          },
        },
      },
    });

    console.log('response: ', response);
    const formattedData = this.formatEvent(response);
    return {
      pagination,
      data: formattedData,
    };
  }

  formatEvent(events: event[] | unknown[]) {
    const formattedData = events.map((e) => {
      e.timestamp = e.timestamp.toString() as unknown as bigint;
      e.args = JSON.parse(e.args);
      let totalSupply = 0;
      if (e.args?.length === 3) {
        totalSupply = new BigNumber(e.args[2].toString())
          .dividedBy(1e18)
          .toNumber();
      }
      const contrant_detail = {
        name: e.address_event_addressToaddress.name,
        symbol:
          e.address_event_addressToaddress.contract_contract_addressToaddress
            .symbol,
      };
      delete e.address_event_addressToaddress;
      return {
        ...e,
        totalSupply,
        contrant_detail,
      };
    });

    return formattedData;
  }
}
