import { Module } from '@nestjs/common';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [VerificationsService, PrismaService],
  controllers: [VerificationsController],
})
export class VerificationsModule {}
