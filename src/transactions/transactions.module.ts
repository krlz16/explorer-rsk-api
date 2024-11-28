import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  providers: [TransactionsService, PrismaService, PaginationService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
