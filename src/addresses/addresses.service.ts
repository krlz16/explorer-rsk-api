import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AddressParserService } from 'src/common/parsers/address-parser.service';
import { PrismaService } from 'src/prisma.service';
import { TAKE_PAGE_DATA } from 'src/common/constants';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    private prisma: PrismaService,
    private addressParser: AddressParserService,
  ) {}

  /**
   * Fetches a paginated list of addresses using keyset pagination.
   *
   * @param {number | null} cursor - The ID to start from (optional).
   * @param {number} take - Number of records per page.
   * @returns {Promise<{ pagination: any, data: any }>} - Paginated list of addresses.
   */
  async getAddresses(take: number = TAKE_PAGE_DATA, cursor?: number) {
    try {
      if (!Number.isInteger(take) || take < 1) {
        throw new BadRequestException(
          `Invalid "take" value: ${take}. Must be a positive integer.`,
        );
      }

      const addresses = await this.prisma.address.findMany({
        take,
        ...(cursor ? { where: { id: { lt: cursor } } } : {}),
        include: {
          address_latest_balance_address_latest_balance_addressToaddress: {
            select: {
              balance: true,
              blockNumber: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      if (addresses.length === 0) {
        return {
          pagination: {
            nextCursor: null,
            take,
          },
          data: [],
        };
      }

      const formattedAddresses = this.addressParser.formatAddresses(addresses);
      const nextCursor =
        formattedAddresses[formattedAddresses.length - 1].id || null;

      return {
        pagination: {
          nextCursor,
          take,
        },
        data: formattedAddresses,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }
  }

  /**
   * Fetches detailed information about a specific address.
   *
   * @param {string} address - The address to fetch details for.
   * @returns {Promise<{ data: any }>} - The formatted address details.
   */
  async getAddress(address: string) {
    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new BadRequestException(
          `Invalid address format: ${address}. Must be a valid 40-character hex string.`,
        );
      }

      const normalizedAddress = address.toLowerCase();

      const addressData = await this.prisma.address.findFirst({
        where: { address: normalizedAddress },
        include: {
          contract_destruction_tx: { select: { tx: true } },
          contract_contract_addressToaddress: {
            include: {
              contract_creation_tx: { select: { tx: true } },
              total_supply: {
                select: { totalSupply: true },
                orderBy: { blockNumber: 'desc' },
                take: 1,
              },
              contract_method: { select: { method: true } },
              contract_interface: { select: { interface: true } },
            },
          },
          address_latest_balance_address_latest_balance_addressToaddress: {
            select: {
              balance: true,
              blockNumber: true,
            },
          },
          miner_address_miner_address_addressToaddress: {
            select: { lastBlockMined: true },
          },
        },
      });

      if (!addressData) {
        return { address: null };
      }

      const formattedAddress = this.addressParser.formatAddress(addressData);

      if (addressData.type === 'contract') {
        const isVerified = await this.isVerified(address);
        formattedAddress.isVerified = isVerified.data;
      }

      return { data: formattedAddress };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(`Failed to fetch address: ${error.message}`);
    }
  }

  /**
   * Fetches contract verification details.
   *
   * @param {string} address - The contract address.
   * @returns {Promise<{ data: any }>} - Contract verification status.
   */
  async getContractVerification(address: string) {
    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new BadRequestException(
          `Invalid address format: ${address}. Must be a valid 40-character hex string.`,
        );
      }

      const verification = await this.prisma.verification_result.findFirst({
        where: { address, match: true },
      });

      if (!verification) {
        return { data: null };
      }

      return {
        data: this.addressParser.formatContractVerification(verification),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(
        `Failed to fetch contract verification: ${error.message}`,
      );
    }
  }

  /**
   * Checks if the contract is verified.
   *
   * @param {string} address - The contract address.
   * @returns {Promise<{ data: boolean }>} - Verification status.
   */
  async isVerified(address: string) {
    try {
      const verification = await this.prisma.verification_result.findFirst({
        where: { address, match: true },
        select: { match: true },
      });

      return {
        data: !!verification,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(
        `Failed to fetch contract verification: ${error.message}`,
      );
    }
  }
}
