import { Module } from '@nestjs/common';
import { PaginationServiceKeySet } from './pagination-key.service';

@Module({
  providers: [PaginationServiceKeySet],
  exports: [PaginationServiceKeySet],
})
export class PaginationModuleKeySet {}
