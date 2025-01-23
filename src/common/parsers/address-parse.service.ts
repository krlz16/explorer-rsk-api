import { Injectable } from '@nestjs/common';
import { address, contract, verification_result } from '@prisma/client';
import BigNumber from 'bignumber.js';

@Injectable()
export class AddressParserService {
  constructor() {}

  formatAddresses(data: any[]) {
    return data.map((a) => {
      const {
        address_latest_balance_address_latest_balance_addressToaddress,
        ...result
      } = a;
      const addressDetail =
        address_latest_balance_address_latest_balance_addressToaddress;
      const balance = new BigNumber(addressDetail.balance.toString(), 16)
        .dividedBy(1e18)
        .toNumber();
      return {
        balance,
        ...result,
        blockNumber: addressDetail.blockNumber,
      };
    });
  }

  formatAddress(address: address | contract | any) {
    if (!address) return null;

    const { contract_contract_addressToaddress: contractAddress, ...response } =
      address || null;

    const code = contractAddress?.code || null;
    const deployedCode = contractAddress?.deployedCode || null;
    const contract_creation_tx = contractAddress?.contract_creation_tx || null;

    let totalSupply = contractAddress?.total_supply[0]?.totalSupply || 0;
    totalSupply = new BigNumber(totalSupply.toString())
      .dividedBy(1e18)
      .toNumber();
    const contract = {
      totalSupply,
      codeStoredAtBlock: contractAddress?.codeStoredAtBlock || null,
      symbol: contractAddress?.symbol || null,
      contract_method: contractAddress?.contract_method || null,
      contract_interface: contractAddress?.contract_interface || null,
    };

    console.log('response: ', response);
    let balance =
      response?.address_latest_balance_address_latest_balance_addressToaddress
        ?.balance || null;

    balance = new BigNumber(balance.toString()).dividedBy(1e18).toNumber();
    console.log('balance: ', balance);

    const data = {
      address: response?.address || null,
      balance,
      blockNumber:
        response?.address_latest_balance_address_latest_balance_addressToaddress
          ?.blockNumber || null,
      isNative: response?.isNative ?? null,
      type: response?.type || null,
      name: response?.name || null,
      code,
      deployedCode,
      createdByTx: contract_creation_tx?.tx
        ? JSON.parse(contract_creation_tx.tx)
        : null,
      ...contract,
      contract_method: contract.contract_method?.map((m) => m.method) || null,
      contract_interface:
        contract.contract_interface?.map((i) => i.interface) || null,
    };
    return data;
  }

  formatContractVerification (verification: verification_result) {
    const {
      id,
      // address,
      match,
      request,
      // result,
      abi,
      // sources,
      timestamp
    } = verification

    const contractVerification = {
      id,
      // address,
      match,
      // result: JSON.parse(result),
      abi: JSON.parse(abi),
      // sources: JSON.parse(sources),
      request: JSON.parse(request), // FUTURE: we should use result prop instead of request prop
      timestamp: timestamp.toString() as unknown as bigint
    }

    return contractVerification
  }
}
