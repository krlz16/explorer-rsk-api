import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { AddressParserService } from 'src/common/parsers/address-parser.service';

@Module({
  providers: [
    AddressesService,
    PrismaService,
    PaginationService,
    AddressParserService,
  ],
  controllers: [AddressesController],
})
export class AddressesModule {}
