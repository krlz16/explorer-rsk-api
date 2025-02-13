import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';

export type AddressOrHash = {
  type: 'address' | 'transactionHash';
  value: string;
};

@Injectable()
export class AddressOrHashValidationPipe implements PipeTransform {
  transform(value: string): AddressOrHash {
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    const isHash = /^0x[a-fA-F0-9]{64}$/.test(value);

    if (!isAddress && !isHash) {
      throw new BadRequestException(
        `Invalid input: "${value}". Must be a valid 40-character address or a 64-character hash.`,
      );
    }

    return {
      type: isAddress ? 'address' : 'transactionHash',
      value,
    };
  }
}
