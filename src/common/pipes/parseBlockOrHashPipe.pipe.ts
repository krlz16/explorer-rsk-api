import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class ParseBlockOrHashPipe implements PipeTransform {
  transform(value: string) {
    if (ethers.isHexString(value, 32)) {
      return value;
    }

    if (!isNaN(Number(value))) {
      return Number(value);
    }

    throw new BadRequestException(
      `Invalid block identifier: ${value}. Must be a number or a valid hash.`,
    );
  }
}
