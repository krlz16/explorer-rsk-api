import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationServiceKeySet {
  paginate({ take, cursor }: { take: number; cursor?: number }) {
    return { take, cursor };
  }
}
