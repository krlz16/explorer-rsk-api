import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('/address/:address')
  getEventsByAddress(
    @Param('address') address: string,
    @Param('page_data') page_data: number,
    @Param('take_data') take_data: number,
  ) {
    return this.eventsService.getEventsByAddress(address, page_data, take_data);
  }

  @Get('/tx/:hash')
  getEventByTxHash(
    @Param('hash') hash: string,
    @Param('page_data') page_data: number,
    @Param('take_data') take_data: number,
  ) {
    return this.eventsService.getTransfersEventByTxHash(
      hash,
      page_data,
      take_data,
    );
  }
}
