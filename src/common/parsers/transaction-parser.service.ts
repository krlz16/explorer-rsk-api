import { Injectable } from '@nestjs/common';
import { transaction } from '@prisma/client';
import BigNumber from 'bignumber.js';
import { TX_STATUS } from '../constants';

@Injectable()
export class TxParserService {
  constructor() {}

  formatTxs(txs: transaction[] | any) {
    const response = txs?.map((tx) => {
      tx.timestamp = tx.timestamp.toString() as unknown as bigint;
      tx.value = new BigNumber(tx.value).dividedBy(1e8).toNumber().toString();
      const receipt = JSON.parse(tx.receipt);
      tx.receipt = receipt;
      const status = Number(receipt.status)
        ? TX_STATUS.SUCCESS
        : TX_STATUS.FAIL;

      const data = {
        ...tx,
        status,
      };
      return data;
    });
    return response;
  }

  formatTx(tx: transaction) {
    tx.timestamp = tx.timestamp.toString() as unknown as bigint;
    tx.gasPrice = new BigNumber(tx.gasPrice.toString())
      .div(new BigNumber(10).pow(18))
      .toFixed()
      .toString();
    tx.value = new BigNumber(tx.value.toString())
      .div(new BigNumber(10).pow(18))
      .toFixed()
      .toString();

    const receipt = JSON.parse(tx.receipt);
    const status = Number(receipt.status) ? TX_STATUS.SUCCESS : TX_STATUS.FAIL;
    return {
      status,
      ...tx,
      receipt,
    };
  }
}
