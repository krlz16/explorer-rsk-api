import { BadRequestException, Injectable } from '@nestjs/common';
import { EventParserService } from 'src/events/parser/event-parser.service';
import { AddressOrHash } from 'src/common/pipes/address-or-hash-validation.pipe';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private eventParser: EventParserService,
  ) {}

  /**
   * Fetch transfer events by ID.
   * @param {string} eventId - Event ID.
   * @returns Transfer events details, including token deatils and transactions details.
   */
  async getEventById(eventId: string) {
    try {
      if (!eventId) {
        throw new BadRequestException('EventId is required');
      }
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
        },
      });

      console.log('response: aqui', response);
      if (!response) {
        return {
          data: null,
        };
      }

      const formattedData = this.eventParser.formatOneEvent(response);
      return {
        data: formattedData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch event by Id: ${error.message}`);
    }
  }
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
        ? take > 0
          ? response.slice(0, Math.abs(take))
          : response.slice(1)
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
                  contract_interface: true,
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
        ? take > 0
          ? response.slice(0, Math.abs(take))
          : response.slice(1)
        : response;

      const formattedData =
        this.eventParser.formatTransferEvent(paginatedEvents);

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
}
