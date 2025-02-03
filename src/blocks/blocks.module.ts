import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { PrismaService } from 'src/prisma.service';
import { BlockParserService } from 'src/common/parsers/block-parser.service';

@Module({
  providers: [BlocksService, PrismaService, BlockParserService],
  controllers: [BlocksController],
})
export class BlocksModule {}
