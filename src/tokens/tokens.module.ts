import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { TokenParserService } from 'src/common/parsers/token-parser.service';

@Module({
  providers: [
    TokensService,
    PrismaService,
    PaginationService,
    TokenParserService,
    TokenParserService,
  ],
  controllers: [TokensController],
})
export class TokensModule {}
