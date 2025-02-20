import { Test, TestingModule } from '@nestjs/testing';
import { EventParserService } from './event-parser.service';
import BigNumber from 'bignumber.js';

describe('EventParserService', () => {
  let service: EventParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventParserService],
    }).compile();

    service = module.get<EventParserService>(EventParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('formatTransferEvent', () => {
    it('should correctly format a single event', () => {
      const mockEvent = {
        eventId: '02c9f0e00300545ccbc4385f86af73db',
        timestamp: '1655296889',
        abi: '{}',
        args: '["0x6306395B37120b1114EF08ee160f7C2f3a263558", "0xa84D2210a4D1809Bba68Db57008686FFCE03b141", "1000000000000000000"]',
        event: 'Transfer',
        transactionIndex: 3,
        txStatus: '0x1',
        address_event_addressToaddress: {
          name: 'IToken',
          address: '0x123',
          contract_contract_addressToaddress: { symbol: 'ITK' },
        },
        transaction: {
          timestamp: '1655296889',
          value: '0x3e252e0',
          receipt: `{
            "logs": [
              {
                "logIndex": 5,
                "blockNumber": 2924302,
                "transactionIndex": 3,
                "address": "0x69fe5cec81d5ef92600c1a0db1f11986ab3758ab",
                "eventId": "02c9f0e00300545ccbc4385f86af73db",
                "timestamp": 1655296889,
                "txStatus": "0x1"
              }
            ]
          }`,
        },
      };

      const result = service.formatOneEvent(mockEvent);

      expect(result).toEqual({
        ...mockEvent,
        timestamp: '1655296889',
        transaction: {
          ...mockEvent.transaction,
          timestamp: '1655296889',
          value: new BigNumber('0x3e252e0').dividedBy(1e18).toString(),
          receipt: {
            logs: [
              {
                logIndex: 5,
                blockNumber: 2924302,
                transactionIndex: 3,
                address: '0x69fe5cec81d5ef92600c1a0db1f11986ab3758ab',
                eventId: '02c9f0e00300545ccbc4385f86af73db',
                timestamp: 1655296889,
                txStatus: '0x1',
              },
            ],
          },
        },
        contrant_detail: {
          name: 'IToken',
          symbol: 'ITK',
        },
      });
    });

    it('should correctly format multiple transfer events', () => {
      const mockEvents = [
        {
          timestamp: '1655296889',
          args: '[0, 1, "0x3e252e0"]',
          address_event_addressToaddress: {
            name: 'Transfer Event',
            contract_contract_addressToaddress: {
              symbol: 'TRF',
            },
          },
        },
        {
          timestamp: '1655296889',
          args: '[0, 1, "0x3e252e0"]',
          address_event_addressToaddress: {
            name: 'Transfer Event 2',
            contract_contract_addressToaddress: {
              symbol: 'TRF2',
            },
          },
        },
      ];

      const result = service.formatTransferEvent(mockEvents);

      expect(result).toEqual([
        {
          ...mockEvents[0],
          timestamp: '1655296889',
          args: [0, 1, '0x3e252e0'],
          totalSupply: new BigNumber('0x3e252e0').dividedBy(1e18).toNumber(),
          contrant_detail: {
            name: 'Transfer Event',
            symbol: 'TRF',
          },
        },
        {
          ...mockEvents[1],
          timestamp: '1655296889',
          args: [0, 1, '0x3e252e0'],
          totalSupply: new BigNumber('0x3e252e0').dividedBy(1e18).toNumber(),
          contrant_detail: {
            name: 'Transfer Event 2',
            symbol: 'TRF2',
          },
        },
      ]);
    });

    it('should return null when given null or undefined input', () => {
      expect(service.formatOneEvent(null)).toBeNull();
      expect(service.formatTransferEvent(null)).toBeNull();
    });
  });
});
