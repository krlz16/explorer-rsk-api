import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, event } from '@prisma/client';
import BigNumber from 'bignumber.js';
import { AddressOrHash } from 'src/common/pipes/address-or-hash-validation.pipe';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}
  /**
   * Fetch paginated events per address using keyset pagination.
   * @param {string} address - The address to filter events by.
   * @param {number} take - Number of records to retrieve.
   * @param {string} cursor - The eventID to start from (optional).
   * @returns Paginated events by address data & pagination.
   */
  async getEventsByAddress(address: string, take: number, cursor?: string) {
    try {
      if (take < 0 && !cursor) {
        throw new BadRequestException(
          'Cannot paginate backward without a cursor.',
        );
      }

      const response = await this.prisma.event.findMany({
        take: take > 0 ? take + 1 : take - 1,
        cursor: cursor ? { eventId: cursor } : undefined,
        skip: cursor ? 1 : undefined,
        where: {
          address_in_event: {
            some: { address },
          },
        },
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
          paginationEvents: {
            nextCursor: null,
            prevCursor: cursor || null,
            take,
            hasMoreData: false,
          },
          data: [],
        };
      }

      const hasMoreData = response.length > Math.abs(take);

      const paginatedEvents = hasMoreData
        ? response.slice(0, Math.abs(take))
        : response;

      const formattedData = paginatedEvents.map((e) => {
        e.timestamp = e.timestamp.toString() as unknown as bigint;
        e.abi = JSON.parse(e.abi);
        e.args = JSON.parse(e.args);
        return e;
      });

      const nextCursor =
        take > 0 && !hasMoreData
          ? null
          : formattedData[formattedData.length - 1]?.eventId;

      const prevCursor =
        !cursor || (take < 0 && !hasMoreData)
          ? null
          : formattedData[0]?.eventId;

      return {
        paginationEvents: {
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
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Fetch transfer events by specific tx hash or address.
   * @param {string} addressOrhash - Transaction hash or address.
   * @param {number} take - Number of records to retrieve.
   * @param {string} cursor - The eventID to start from (optional).
   * @returns Event details.
   */
  async getTransfersEventByTxHashOrAddress(
    addressOrhash: AddressOrHash,
    take: number,
    cursor?: string,
  ) {
    try {
      if (take < 0 && !cursor) {
        throw new BadRequestException(
          'Cannot paginate backward without a cursor.',
        );
      }

      const where = {
        event: 'Transfer',
        [addressOrhash.type]: addressOrhash.value,
      };

      const response = await this.prisma.event.findMany({
        take: take > 0 ? take + 1 : take - 1,
        cursor: cursor ? { eventId: cursor } : undefined,
        skip: cursor ? 1 : undefined,
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
        orderBy: {
          eventId: 'desc',
        },
      });

      if (response.length <= 0 || !response) {
        return {
          paginationEvents: {
            nextCursor: null,
            prevCursor: cursor || null,
            take,
            hasMoreData: false,
          },
          data: [],
        };
      }

      const hasMoreData = response.length > Math.abs(take);

      const paginatedEvents = hasMoreData
        ? response.slice(0, Math.abs(take))
        : response;

      const formattedData = this.formatEvent(paginatedEvents);

      const nextCursor =
        take > 0 && !hasMoreData
          ? null
          : formattedData[formattedData.length - 1]?.eventId;

      const prevCursor =
        !cursor || (take < 0 && !hasMoreData)
          ? null
          : formattedData[0]?.eventId;

      return {
        paginationEvents: {
          nextCursor,
          prevCursor,
          hasMoreData,
          take,
        },
        data: formattedData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Format event data.
   * @param {event[]} events - Event data to format.
   * @returns Formatted event data.
   */
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
