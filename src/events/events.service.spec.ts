import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { EventParserService } from 'src/events/parser/event-parser.service';

describe('EventsService', () => {
  let service: EventsService;
  let prismaMock: PrismaService;
  let paginationMock: PaginationService;
  let eventParserMock: EventParserService;

  beforeEach(async () => {
    prismaMock = {
      event: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    } as unknown as PrismaService;

    eventParserMock = {
      formatOneEvent: jest.fn(),
    } as unknown as EventParserService;

    paginationMock = {} as PaginationService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        EventParserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: PaginationService,
          useValue: paginationMock,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //Tests for getEventsByAddress
  it('should return paginated events for a valid address', async () => {
    const mockEvents = [
      {
        eventId: 'event1',
        timestamp: 1738848907,
        abi: '{}',
        args: '[]',
        address_in_event: [
          {
            address: '0x6306395B37120b1114EF08ee160f7C2f3a263558',
            isEventEmitterAddress: true,
          },
        ],
      },
      {
        eventId: 'event2',
        timestamp: 1738848874,
        abi: '{}',
        args: '[]',
        address_in_event: [
          {
            address: '0x6306395B37120b1114EF08ee160f7C2f3a263558',
            isEventEmitterAddress: false,
          },
        ],
      },
    ];

    (prismaMock.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

    const result = await service.getEventsByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
    );

    expect(result.paginationEvents).toEqual({
      nextCursor: null,
      prevCursor: null,
      take: 2,
      hasMoreData: false,
    });
    expect(result.data.length).toBe(2);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      take: 3,
      where: {
        address_in_event: {
          some: { address: '0x6306395B37120b1114EF08ee160f7C2f3a263558' },
        },
      },
      orderBy: { eventId: 'desc' },
      include: {
        address_in_event: {
          select: { address: true, isEventEmitterAddress: true },
        },
      },
    });
  });

  it('should return empty response when no events exist', async () => {
    (prismaMock.event.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getEventsByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
    );

    expect(result).toEqual({
      paginationEvents: {
        nextCursor: null,
        prevCursor: null,
        take: 2,
        hasMoreData: false,
      },
      data: [],
    });
  });

  it('should return events with pagination and cursor', async () => {
    const mockEvents = [
      {
        eventId: 'event50',
        timestamp: 1700000002,
        abi: '{}',
        args: '[]',
        address_in_event: [
          { address: '0xAddress', isEventEmitterAddress: true },
        ],
      },
      {
        eventId: 'event49',
        timestamp: 1700000003,
        abi: '{}',
        args: '[]',
        address_in_event: [
          { address: '0xAddress', isEventEmitterAddress: false },
        ],
      },
    ];

    (prismaMock.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

    const result = await service.getEventsByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
      'event51',
    );

    expect(result.paginationEvents).toEqual({
      nextCursor: null,
      prevCursor: 'event50',
      take: 2,
      hasMoreData: false,
    });
  });

  it('should throw an error when Prisma query fails', async () => {
    (prismaMock.event.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.getEventsByAddress(
        '0x6306395B37120b1114EF08ee160f7C2f3a263558',
        2,
      ),
    ).rejects.toThrow('Failed to fetch events: Database error');
  });

  // Tests for getTransfersEventByTxHashOrAddress
  it('should return transfer events for a valid hash', async () => {
    const mockEvents = [
      {
        eventId: 'event100',
        timestamp: 1738848907,
        abi: '{}',
        args: '["0x6306395B37120b1114EF08ee160f7C2f3a263558", "0xa84D2210a4D1809Bba68Db57008686FFCE03b141", "1000000000000000000"]',
        address_event_addressToaddress: {
          name: 'Token',
          contract_contract_addressToaddress: { symbol: 'TKN' },
        },
      },
    ];

    (prismaMock.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

    const result = await service.getTransfersEventByTxHashOrAddress(
      {
        type: 'transactionHash',
        value:
          '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
      },
      2,
    );

    expect(result.paginationEvents).toEqual({
      nextCursor: null,
      prevCursor: null,
      take: 2,
      hasMoreData: false,
    });
    expect(result.data[0].contrant_detail.name).toBe('Token');
    expect(result.data[0].contrant_detail.symbol).toBe('TKN');
  });

  it('should return transfer events with pagination and cursor', async () => {
    const mockEvents = [
      {
        eventId: 'event50',
        timestamp: 1700000002,
        abi: '{}',
        args: '["0xFrom", "0xTo", "1000000000000000000"]',
        address_event_addressToaddress: {
          name: 'Token',
          contract_contract_addressToaddress: { symbol: 'TKN' },
        },
      },
      {
        eventId: 'event49',
        timestamp: 1700000003,
        abi: '{}',
        args: '["0xFrom", "0xTo", "500000000000000000"]',
        address_event_addressToaddress: {
          name: 'Token',
          contract_contract_addressToaddress: { symbol: 'TKN' },
        },
      },
    ];

    (prismaMock.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

    const result = await service.getTransfersEventByTxHashOrAddress(
      {
        type: 'transactionHash',
        value:
          '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
      },
      2,
      'event51',
    );

    expect(result.paginationEvents).toEqual({
      nextCursor: null,
      prevCursor: 'event50',
      take: 2,
      hasMoreData: false,
    });
    expect(result.data.length).toBe(2);
  });

  it('should return empty response when no transfer events exist', async () => {
    (prismaMock.event.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getTransfersEventByTxHashOrAddress(
      {
        type: 'transactionHash',
        value:
          '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
      },
      2,
    );

    expect(result).toEqual({
      paginationEvents: {
        nextCursor: null,
        prevCursor: null,
        take: 2,
        hasMoreData: false,
      },
      data: [],
    });
  });

  it('should return transfer events when querying by valid address', async () => {
    const mockEvents = [
      {
        eventId: 'event100',
        timestamp: 1738848907,
        abi: '{}',
        args: '["0xff54A7563fc6bB7A34Ca66B41265f7f7D61b3a7D", "0xRecipient", "1000000000000000000"]',
        address_event_addressToaddress: {
          name: 'Token',
          contract_contract_addressToaddress: { symbol: 'TKN' },
        },
      },
    ];

    (prismaMock.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

    const result = await service.getTransfersEventByTxHashOrAddress(
      {
        type: 'transactionHash',
        value:
          '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
      },
      2,
    );

    expect(result.paginationEvents).toEqual({
      nextCursor: null,
      prevCursor: null,
      take: 2,
      hasMoreData: false,
    });
    expect(result.data[0].contrant_detail.name).toBe('Token');
    expect(result.data[0].contrant_detail.symbol).toBe('TKN');
  });

  it('should throw an error when Prisma query fails', async () => {
    (prismaMock.event.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.getTransfersEventByTxHashOrAddress(
        {
          type: 'transactionHash',
          value:
            '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
        },
        2,
      ),
    ).rejects.toThrow('Failed to fetch events: Database error');
  });

  // Tests for getEventById
  it('should return event by a valid eventId', async () => {
    const mockEvents = {
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

    (prismaMock.event.findFirst as jest.Mock).mockResolvedValue(mockEvents);
    (eventParserMock.formatOneEvent as jest.Mock).mockReturnValue(mockEvents);

    const result = await service.getEventById(
      '02c9f0e00300545ccbc4385f86af73db',
    );
    expect(result.data.eventId).toBe('02c9f0e00300545ccbc4385f86af73db');
    expect(result.data.transaction.receipt.logs[0].eventId).toBe(
      '02c9f0e00300545ccbc4385f86af73db',
    );
    expect(result.data.contrant_detail.name).toBe('IToken');
    expect(result.data.contrant_detail.symbol).toBe('ITK');
  });

  it('Should return null response if event does not exist', async () => {
    (prismaMock.event.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.getEventById('02c9f0e00');

    expect(result).toEqual({
      data: null,
    });
  });

  it('Should return an error when eventId is missing', async () => {
    (prismaMock.event.findFirst as jest.Mock).mockRejectedValue(null);

    await expect(service.getEventById('')).rejects.toThrow(
      'EventId is required',
    );
  });
});
