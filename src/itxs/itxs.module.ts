import { Module } from '@nestjs/common';
import { ItxsService } from './itxs.service';
import { ItxsController } from './itxs.controller';

@Module({
  providers: [ItxsService],
  controllers: [ItxsController]
})
export class ItxsModule {}
