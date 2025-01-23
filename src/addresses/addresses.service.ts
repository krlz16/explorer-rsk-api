import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { AddressParserService } from 'src/common/parsers/address-parse.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AddressesService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
    private addressParser: AddressParserService,
  ) {}

  async getAddresses(page_data: number, take_data: number) {
    console.log('getAddresses: ');
    const count = await this.prisma.address.count();
    console.log('count: ', count);

    const pagination = this.pgService.paginate({
      page_data,
      take_data,
      count,
    });

    const data = await this.prisma.address.findMany({
      take: pagination.take,
      skip: pagination.skip,
      include: {
        address_latest_balance_address_latest_balance_addressToaddress: {
          select: {
            balance: true,
            blockNumber: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    const formatData = this.addressParser.formatAddresses(data);

    return {
      pagination,
      data: formatData,
    };
  }

  async getAddress(address: string) {
    const value = await this.prisma.address.findFirst({
      where: {
        address: address.toLowerCase(),
      },
      include: {
        contract_destruction_tx: {
          select: {
            tx: true,
          },
        },
        contract_contract_addressToaddress: {
          include: {
            contract_creation_tx: {
              select: {
                tx: true,
              },
            },
            total_supply: {
              select: {
                totalSupply: true,
              },
              orderBy: {
                blockNumber: 'desc',
              },
              take: 1,
            },
            contract_method: {
              select: {
                method: true,
              },
            },
            contract_interface: {
              select: {
                interface: true,
              },
            },
          },
        },
        address_latest_balance_address_latest_balance_addressToaddress: {
          select: {
            balance: true,
            blockNumber: true,
          },
        },
        miner_address_miner_address_addressToaddress: {
          select: {
            lastBlockMined: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
    const res = await this.prisma.contract_verification.findFirst({
      where: {
        address,
      },
    });
    console.log('res: ', res);
    console.log('value: ', value);
    const formatAddress = this.addressParser.formatAddress(value);

    return {
      data: formatAddress,
    };
  }

  async getContractDetail(address: string) {
    const response = await this.prisma.verification_result.findFirst({
      where: {
        address,
        match: true,
      },
      select: {
        request: true,
        abi: true,
        timestamp: true,
      },
    });

    response.timestamp = response?.timestamp.toString() as unknown as bigint;
    response.request = JSON.parse(response.request);
    response.abi = JSON.parse(response.abi);
    return {
      data: response,
    };
  }
}
