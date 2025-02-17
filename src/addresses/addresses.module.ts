import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { PrismaService } from 'src/prisma.service';
import { AddressParserService } from 'src/common/parsers/address-parser.service';

@Module({
  providers: [AddressesService, PrismaService, AddressParserService],
  controllers: [AddressesController],
})
export class AddressesModule {}
