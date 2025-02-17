import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { EventParserService } from 'src/events/parser/event-parser.service';

@Module({
  providers: [
    EventsService,
    PrismaService,
    PaginationService,
    EventParserService,
  ],
  controllers: [EventsController],
})
export class EventsModule {}
