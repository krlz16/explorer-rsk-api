import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class BlockIdentifierPipe implements PipeTransform {
  transform(value: string): number | string {
    // check if the value is a valid 64-character hexadecimal hash
    if (/^0x[a-fA-F0-9]{64}$/.test(value)) {
      return value;
    }

    // check if it's a numeric string (block number)
    if (/^\d+$/.test(value)) {
      const numericValue = parseInt(value, 10);
      this.validateBlockNumber(numericValue);
      return numericValue;
    }

    throw new BadRequestException(
      `Invalid block identifier: ${value}. Must be a 64-character hex string or a non-negative integer.`,
    );
  }

  private validateBlockNumber(block: number) {
    if (!Number.isInteger(block) || block < 0) {
      throw new BadRequestException(
        `Invalid block number: ${block}. Must be a non-negative integer.`,
      );
    }

    if (block > 2147483647) {
      throw new BadRequestException(
        `Block number ${block} exceeds the allowed limit of 2,147,483,647.`,
      );
    }
  }
}
