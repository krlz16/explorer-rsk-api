import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { TokensModule } from './tokens/tokens.module';
import { BlocksModule } from './blocks/blocks.module';
import { AddressesModule } from './addresses/addresses.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaginationModule } from './common/pagination/pagination.module';
import { ItxsModule } from './itxs/itxs.module';
import { StatsModule } from './stats/stats.module';
import { EventsModule } from './events/events.module';
import { BalancesModule } from './balances/balances.module';

@Module({
  imports: [
    TokensModule,
    BlocksModule,
    AddressesModule,
    TransactionsModule,
    PaginationModule,
    ItxsModule,
    StatsModule,
    EventsModule,
    BalancesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
