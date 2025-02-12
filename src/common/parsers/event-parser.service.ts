import { Injectable } from "@nestjs/common";
import { event } from "@prisma/client";
import BigNumber from "bignumber.js";

@Injectable()
export class EventParserService {
  constructor() {}

  formatOneEvent(event: event | any, eventId: string) {
    event.timestamp = event.timestamp.toString() as unknown as bigint;
    event.transaction.timestamp = event.transaction.timestamp.toString() as unknown as bigint;
    const receipt = JSON.parse(event.transaction.receipt);
    event.transaction.value = new BigNumber(event.transaction.value.toString(), 16)
      .dividedBy(1e18)
      .toNumber()
      .toString();
    const log = receipt?.logs?.filter((l) => l.eventId === eventId);
    receipt.logs = log;
    event.transaction.receipt = receipt;
    const contrant_detail = {
      name: event.address_event_addressToaddress.name,
      symbol:
        event.address_event_addressToaddress.contract_contract_addressToaddress
          .symbol,
    };
    delete event.address_event_addressToaddress;
    return {
      ...event,
      contrant_detail,
    }
  }

  formatTransferEvent(events: event[] | unknown[]) {
    const formattedData = events.map((e) => {
      e.timestamp = e.timestamp.toString() as unknown as bigint;
      e.args = JSON.parse(e.args);
      let totalSupply = 0;
      if (e.args?.length === 3) {
        totalSupply = new BigNumber(e.args[2].toString())
          .dividedBy(new BigNumber(10).pow(18))
          .toNumber();
      }
      const contrant_detail = {
        name: e.address_event_addressToaddress.name,
        symbol:
          e.address_event_addressToaddress.contract_contract_addressToaddress
            .symbol,
      };
      const contract_interface = e?.address_event_addressToaddress.contract_contract_addressToaddress?.contract_interface;
      delete e.address_event_addressToaddress;
      return {
        ...e,
        totalSupply,
        contrant_detail,
        contract_interface: contract_interface?.map((c) => c.interface),
      };
    });

    return formattedData;
  }
}