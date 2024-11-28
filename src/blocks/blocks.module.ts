import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  providers: [BlocksService, PrismaService, PaginationService],
  controllers: [BlocksController],
})
export class BlocksModule {}
