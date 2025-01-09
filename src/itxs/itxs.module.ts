import { Module } from '@nestjs/common';
import { ItxsService } from './itxs.service';
import { ItxsController } from './itxs.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  providers: [ItxsService, PrismaService, PaginationService],
  controllers: [ItxsController],
})
export class ItxsModule {}
