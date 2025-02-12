import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CursorValidationPipe implements PipeTransform {
  transform(value: string): number {
    if (!value) return undefined;

    const numericValue = parseInt(value, 10);

    if (isNaN(numericValue)) {
      throw new BadRequestException(`"cursor" must be an integer.`);
    }

    if (numericValue < 0) {
      throw new BadRequestException(`"cursor" must be a non-negative integer.`);
    }

    return numericValue;
  }
}
