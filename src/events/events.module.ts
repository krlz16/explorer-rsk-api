import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  providers: [EventsService, PrismaService, PaginationService],
  controllers: [EventsController],
})
export class EventsModule {}
