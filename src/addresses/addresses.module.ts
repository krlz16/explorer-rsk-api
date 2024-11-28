import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  providers: [AddressesService, PrismaService, PaginationService],
  controllers: [AddressesController],
})
export class AddressesModule {}
