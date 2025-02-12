import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AddressValidationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Address should not be empty.');
    }

    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    if (!isValidAddress) {
      throw new BadRequestException(`Invalid address format: ${value}`);
    }

    return value.toLowerCase(); // Normalize to lowercase if needed
  }
}
