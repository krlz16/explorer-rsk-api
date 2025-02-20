import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class TransactionHashValidationPipe implements PipeTransform {
  transform(value: string): string {
    const isHash = /^0x[a-fA-F0-9]{64}$/.test(value);

    if (!isHash) {
      throw new BadRequestException(
        `Invalid input: "${value}". Must be a valid a 64-character hash.`,
      );
    }

    return value.toLowerCase();
  }
}
