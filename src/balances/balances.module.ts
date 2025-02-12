import { Module } from '@nestjs/common';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BalancesController],
  providers: [BalancesService, PrismaService],
})
export class BalancesModule {}
