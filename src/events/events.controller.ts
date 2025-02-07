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
   * @param {number} cursor - The block number to start from (optional).
   * @returns
   */
  @Get('/address/:address')
  getEventsByAddress(
    @Param('address') address: string,
    @Query('take') take?: number,
    @Query('cursor') cursor?: number,
  ) {
    const takeData = take || TAKE_PAGE_DATA;
    return this.eventsService.getEventsByAddress(address, takeData, cursor);
  }

  @Get('/tx/:hash')
  getEventByTxHash(
    @Param('hash') hash: string,
    @Param('page_data') page_data: number,
    @Param('take_data') take_data: number,
  ) {
    return this.eventsService.getTransfersEventByTxHashOrAddress(
      hash,
      page_data,
      take_data,
    );
  }

  @Get('/transfer/:address')
  getTransfersEventByAddress(
    @Param('address') address: string,
    @Param('page_data') page_data: number,
    @Param('take_data') take_data: number,
  ) {
    return this.eventsService.getTransfersEventByTxHashOrAddress(
      address,
      page_data,
      take_data,
    );
  }
}
