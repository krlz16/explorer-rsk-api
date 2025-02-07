import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, event } from '@prisma/client';
import { isAddress } from '@rsksmart/rsk-utils';
import BigNumber from 'bignumber.js';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}
  /**
   * Fetch paginated events per address using keyset pagination.
   * @param {string} address - The address to filter events by.
   * @param {number} take - Number of records to retrieve.
   * @param {number} cursor - The block number to start from (optional).
   * @returns Paginated events by address data.
   */
  async getEventsByAddress(address: string, take: number, cursor?: number) {
    try {
      if (!Number.isInteger(take) || take < 1) {
        throw new BadRequestException(
          `Invalid "take" value: ${take}. Must be a positive integer.`,
        );
      }

      const where = {
        address_in_event: {
          some: { address },
        },
        ...(cursor ? { blockNumber: { lt: cursor } } : {}),
      };

      const response = await this.prisma.event.findMany({
        take,
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

      if (response.length <= 0) {
        return {
          pagination: {
            nextCursor: null,
            take,
          },
          data: [],
        };
      }

      const formattedData = response.map((e) => {
        e.timestamp = e.timestamp.toString() as unknown as bigint;
        e.abi = JSON.parse(e.abi);
        e.args = JSON.parse(e.args);
        return e;
      });

      const nextCursor = formattedData[formattedData.length - 1].blockNumber;

      return {
        pagination: {
          nextCursor,
          take,
        },
        data: formattedData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch blocks: ${error.message}`);
    }
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
          .dividedBy(new BigNumber(10).pow(18))
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
