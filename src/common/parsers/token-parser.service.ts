import { Injectable } from '@nestjs/common';
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
}
