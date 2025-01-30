import { Module } from '@nestjs/common';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  controllers: [BalancesController],
  providers: [BalancesService, PrismaService, PaginationService],
})
export class BalancesModule {}
