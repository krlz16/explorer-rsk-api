import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenParserService {
  constructor() {}

  formatTokens(data: any[]) {
    const formattedData = data.map((item) => {
      const { balance, blockNumber } =
        item.address_latest_balance_address_latest_balance_addressToaddress;

      const symbol = item?.contract_contract_addressToaddress.symbol || null;

      return {
        name: item.name,
        address: item.address,
        symbol,
        balance,
        blockNumber,
      };
    });

    return formattedData;
  }
}
