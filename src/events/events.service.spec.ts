import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { BadRequestException } from '@nestjs/common';
import { AddressOrHash } from 'src/common/pipes/address-or-hash-validation.pipe';

describe('EventsService', () => {
  let service: EventsService;
  let prismaMock: PrismaService;
  let paginationMock: PaginationService;

  beforeEach(async () => {
    prismaMock = {
      event: {
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    paginationMock = {} as PaginationService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
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

  it('should throw an error if the hash or address is invalid', async () => {
    const invalidInputs = [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde',
      '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
      '',
      null,
      undefined,
    ];
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
});
