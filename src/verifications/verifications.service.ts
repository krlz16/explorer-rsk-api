import { Injectable } from '@nestjs/common';
import { EVM_VERSIONS } from 'src/constants/evm.constants';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VerificationsService {
  constructor(
      private prisma: PrismaService,
    ) {}
  
  getEvmVersions() : string[] {
    return EVM_VERSIONS;
  }
}
