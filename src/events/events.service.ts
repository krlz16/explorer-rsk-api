import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isAddress } from '@rsksmart/rsk-utils';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { EventParserService } from 'src/common/parsers/event-parser.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
    private eventParser: EventParserService
  ) {}

  async getEventById(eventId: string) {
    const response = await this.prisma.event.findFirst({
      where: {
        eventId,
      },
      include: {
        address_event_addressToaddress: {
          select: {
            name: true,
            address: true,
            contract_contract_addressToaddress: {
              select: {
                symbol: true,
              },
            },  
          },
        },
        transaction: true,
      },
      orderBy: {
        eventId: 'desc',
      }
    });

    if (!response) {
      return {
        data: null,
      };
    }

    const formattedData = this.eventParser.formatOneEvent(response, eventId);
    return {
      data: formattedData,
    };
  }

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

  async getTransfersEventByTxHashOrAddress(
    addressOrhash: string,
    page_data: number,
    take_data: number,
  ) {
    const isOneAddress = isAddress(addressOrhash);

    const where = {
      event: {
        equals: 'Transfer',
        mode: 'insensitive' as Prisma.QueryMode,
      },
      [isOneAddress ? 'address' : 'transactionHash']: addressOrhash,
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

    if (!response.length) {
      return {
        data: null,
      };
    }

    const formattedData = this.eventParser.formatTransferEvent(response);
    return {
      pagination,
      data: formattedData,
    };
  }

}
