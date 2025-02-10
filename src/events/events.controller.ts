import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  /**
   * Fetch a paginated list of events using keyset pagination.
   * @param {string} address - The address to filter events by.
   * @param {number} take - Number of records to retrieve.
   * @param {string} cursor - The eventID to start from (optional).
   * @returns Paginated events data.
   */
  @Get('/address/:address')
  getEventsByAddress(
    @Param('address') address: string,
    @Query('take') take?: number,
    @Query('cursor') cursor?: string,
  ) {
    const takeData = take || TAKE_PAGE_DATA;
    return this.eventsService.getEventsByAddress(address, takeData, cursor);
  }

  /**
   * Fetch transfer events by speficit tx hash or address.
   * @param {string} addressOrhash - Transaction hash.
   * @param take - Number of records to retrieve.
   * @param cursor - The block number to start from (optional).
   * @returns Event details.
   */
  @Get('/tx/:addressOrhash')
  getEventByTxHash(
    @Param('addressOrhash') addressOrhash: string,
    @Query('take') take?: number,
    @Query('cursor') cursor?: number,
  ) {
    const takeData = take || TAKE_PAGE_DATA;
    return this.eventsService.getTransfersEventByTxHashOrAddress(
      addressOrhash,
      takeData,
      cursor,
    );
  }
}
