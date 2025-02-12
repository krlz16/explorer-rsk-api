import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Injectable()
export class TakeValidationPipe implements PipeTransform {
  transform(value: string): number {
    const numericValue = parseInt(value, 10);

    if (isNaN(numericValue)) {
      throw new BadRequestException(`"take" must be an integer.`);
    }

    if (Math.abs(numericValue) > TAKE_PAGE_DATA) {
      throw new BadRequestException(
        `Cannot fetch more than ${TAKE_PAGE_DATA} items at a time. Requested: ${numericValue}`,
      );
    }

    if (numericValue === 0) {
      return TAKE_PAGE_DATA;
    }

    return numericValue;
  }
}
