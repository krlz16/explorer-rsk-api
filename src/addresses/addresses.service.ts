import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AddressesService {
  constructor(
    private prisma: PrismaService,
    private pgService: PaginationService,
  ) {}

  async getAddresses(page_data: number, take_data: number) {
    console.log('getAddresses: ');
    const count = await this.prisma.address.count();
    console.log('count: ', count);
    // const count = await this.prisma.address.count();

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

    const formatData = this.formatAddresses(data);

    return {
      pagination,
      data: formatData,
    };
  }

  async getAddress(address: string) {
    console.log('address: ', address);
    // const where = {
    //   address,
    // };
    const value = await this.prisma.address.findFirst({
      where: {
        address,
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
    const { contract_contract_addressToaddress, ...response } = value || null;

    const code = contract_contract_addressToaddress?.code || null;
    const deployedCode =
      contract_contract_addressToaddress?.deployedCode || null;
    const contract_creation_tx =
      contract_contract_addressToaddress?.contract_creation_tx || null;

    const addd = {
      codeStoredAtBlock:
        contract_contract_addressToaddress?.codeStoredAtBlock || null,
      symbol: contract_contract_addressToaddress?.symbol || null,
      contract_method:
        contract_contract_addressToaddress?.contract_method || null,
      contract_interface:
        contract_contract_addressToaddress?.contract_interface || null,
    };
    console.log('addd: ', addd);
    console.log('response: ', response);
    const data = {
      address: response?.address || null,
      balance:
        response?.address_latest_balance_address_latest_balance_addressToaddress
          ?.balance || null,
      blockNumber:
        response?.address_latest_balance_address_latest_balance_addressToaddress
          ?.blockNumber || null,
      isNative: response?.isNative ?? null,
      type: response?.type || null,
      name: response?.name || null,
      codeStoredAtBlock: addd.codeStoredAtBlock,
      symbol: addd.symbol,
      code,
      deployedCode,
      createdByTx: contract_creation_tx?.tx
        ? JSON.parse(contract_creation_tx.tx)
        : null,
      contractMethods: addd.contract_method?.map((m) => m.method) || null,
      interfaces: addd.contract_interface?.map((i) => i.interface) || null,
    };

    return {
      data,
    };
  }

  async getTxsByAddress(hash: string) {
    const response = await this.prisma.transaction.findMany({
      where: {
        OR: [
          {
            from: hash,
          },
          {
            to: hash,
          },
        ],
      },
      select: {
        hash: true,
        blockNumber: true,
        from: true,
        to: true,
        value: true,
        gasUsed: true,
        timestamp: true,
        txType: true,
        receipt: true,
      },
      orderBy: {
        txId: 'desc',
      },
    });

    const formatData = response.map((tx) => {
      tx.timestamp = tx.timestamp.toString() as unknown as bigint;
      tx.receipt = JSON.parse(tx.receipt);
      return tx;
    });

    return {
      data: formatData,
    };
  }

  private formatAddresses(data: any[]) {
    return data.map((a) => {
      const {
        address_latest_balance_address_latest_balance_addressToaddress,
        ...result
      } = a;
      const addressDetail =
        address_latest_balance_address_latest_balance_addressToaddress;
      return {
        ...result,
        ...addressDetail,
      };
    });
  }
}
