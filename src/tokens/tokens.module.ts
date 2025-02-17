import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { PrismaService } from 'src/prisma.service';
import { TokenParserService } from 'src/common/parsers/token-parser.service';

@Module({
  providers: [
    TokensService,
    PrismaService,
    TokenParserService,
    TokenParserService,
  ],
  controllers: [TokensController],
})
export class TokensModule {}
