import { Injectable } from '@nestjs/common';
import { address, contract, verification_result } from '@prisma/client';
import BigNumber from 'bignumber.js';

@Injectable()
export class AddressParserService {
  constructor() {}

  /**
   * Formats an array of address data.
   *
   * @param {any[]} data - The array of address objects.
   * @returns {any[]} - The formatted array of addresses with balance and block number.
   */
  formatAddresses(data: any[]) {
    return data.map((item) => {
      const {
        address_latest_balance_address_latest_balance_addressToaddress:
          latestBalance,
        ...rest
      } = item;

      const balance = latestBalance
        ? new BigNumber(latestBalance.balance, 16).dividedBy(1e18).toNumber()
        : 0;

      return {
        balance,
        ...rest,
        blockNumber: latestBalance?.blockNumber ?? null,
      };
    });
  }

  /**
   * Formats a single address or contract object.
   *
   * @param {address | contract | any} addressData - The address object.
   * @returns {any} - The formatted address object.
   */
  formatAddress(addressData: address | contract | any): any {
    if (!addressData) return null;

    const {
      contract_contract_addressToaddress: contractDetails,
      address_latest_balance_address_latest_balance_addressToaddress:
        latestBalance,
      ...response
    } = addressData;

    // Convert balance from wei to RBTC
    const balance = latestBalance?.balance
      ? new BigNumber(latestBalance.balance).dividedBy(1e18).toNumber()
      : 0;

    // Extract contract details if the address is a contract
    const contractCreationTx = contractDetails?.contract_creation_tx?.tx
      ? JSON.parse(contractDetails.contract_creation_tx.tx)
      : null;

    const totalSupply = contractDetails?.total_supply?.[0]?.totalSupply
      ? new BigNumber(contractDetails.total_supply[0].totalSupply)
          .dividedBy(1e18)
          .toNumber()
      : 0;

    // Construct contract-specific information
    const contractInfo = contractDetails
      ? {
          totalSupply,
          code: contractDetails?.code || null,
          deployedCode: contractDetails?.deployedCode || null,
          codeStoredAtBlock: contractDetails?.codeStoredAtBlock ?? null,
          symbol: contractDetails?.symbol ?? null,
          contractMethod:
            contractDetails?.contract_method?.map((m) => m.method) ?? null,
          contractInterface:
            contractDetails?.contract_interface?.map((i) => i.interface) ??
            null,
        }
      : {};

    return {
      isVerified: null,
      address: response?.address ?? null,
      balance,
      blockNumber: latestBalance?.blockNumber ?? null,
      isNative: response?.isNative ?? null,
      type: response?.type ?? null,
      name: response?.name ?? null,
      createdByTx: contractCreationTx,
      ...contractInfo, // Spread contract details only if available
    };
  }

  formatContractVerification(verification: verification_result) {
    const {
      id,
      // address,
      match,
      request,
      result,
      abi,
      sources,
      timestamp,
    } = verification;
    const files = this.formatContractFiles(JSON.parse(sources));
    const dataRequest = JSON.parse(request);
    const contractVerification = {
      id,
      // address,
      match,
      result: JSON.parse(result),
      abi: JSON.parse(abi),
      sources: files,
      request: dataRequest, // FUTURE: we should use result prop instead of request prop
      timestamp: timestamp.toString() as unknown as bigint,
    };
    return contractVerification;
  }

  formatContractFiles(sources: string | any) {
    let data: any;
    for (const key in sources) {
      if (Object.prototype.hasOwnProperty.call(sources, key)) {
        const element = sources[key];
        if (element.contents) {
          data = element.contents;
          break;
        }
      }
    }
    const fileRegex = /\/\/ File\s+(.*?)\n([\s\S]*?)(?=\/\/ File|$)/g;
    const resources: { file: string; content: string }[] = [];
    let match: RegExpExecArray | null;
    while ((match = fileRegex.exec(data)) !== null) {
      const fullPath = match[1].trim();
      const file = fullPath.match(/([^/]+\.sol)/)[1];
      const content = match[2].trim();
      const existFile = resources.find((f) => f.file === file);
      if (!existFile) {
        resources.push({ file, content });
      }
    }
    if (resources.length === 0) {
      resources.push({ file: sources[0].name, content: data.trim() });
    }
    return resources;
  }
}
