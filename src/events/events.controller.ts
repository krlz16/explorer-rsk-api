import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('/:id')
  getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

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
