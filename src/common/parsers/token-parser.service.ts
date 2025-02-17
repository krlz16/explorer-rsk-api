import { Injectable } from '@nestjs/common';
import { token_address } from '@prisma/client';
import BigNumber from 'bignumber.js';

@Injectable()
export class TokenParserService {
  constructor() {}

  formatTokens(data: any[]) {
    const formattedData = data.map((item) => {
      const { balance, blockNumber } =
        item.address_latest_balance_address_latest_balance_addressToaddress;

      const symbol =
        item?.contract_contract_addressToaddress.symbol || '(Not provided)';

      const name = item?.name || '(Not provided)';

      const balanceFormatted = balance
        ? new BigNumber(balance, 16).dividedBy(1e18).toNumber()
        : 0;

      return {
        id: item.id,
        name,
        address: item.address,
        symbol,
        balance: balanceFormatted,
        blockNumber,
      };
    });

    return formattedData;
  }

  formatTokensByAddress(tokens: token_address[] | any[]) {
    const formattedData = tokens?.map((item) => {
      const { contract_token_address_contractTocontract: contract } = item;
      const balance = new BigNumber(item.balance).dividedBy(1e18).toString();
      item.balance = balance;
      delete item.contract_token_address_contractTocontract;
      return {
        contract_interface:
          contract?.contract_contract_addressToaddress.contract_interface?.map(
            (i) => i.interface,
          ),
        symbol: contract?.contract_contract_addressToaddress.symbol,
        name: contract?.name,
        ...item,
      };
    });

    return formattedData;
  }
}
