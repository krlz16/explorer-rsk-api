import { Injectable } from '@nestjs/common';
import { TAKE_PAGE_DATA } from '../constants';
import {
  IPaginationOptions,
  IPaginationResult,
} from './interfaces/Pagination.interface';

@Injectable()
export class PaginationService {
  paginate({
    page_data,
    take_data,
    count,
  }: IPaginationOptions): IPaginationResult {
    const page = page_data || 1;
    const take = take_data || TAKE_PAGE_DATA;

    const skip = (page - 1) * (take > count ? 0 : take);
    const totalPages = Math.ceil(count / take);

    return {
      skip,
      take,
      totalPages,
      currentPage: page,
    };
  }
}
