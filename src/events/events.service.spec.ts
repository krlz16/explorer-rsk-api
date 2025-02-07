import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { BadRequestException } from '@nestjs/common';

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

  it('should return paginated events for a valid address', async () => {
    const mockEvents = [
      {
        blockNumber: 100,
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
        blockNumber: 99,
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

    expect(result.pagination).toEqual({ nextCursor: 99, take: 2 });
    expect(result.data.length).toBe(2);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      take: 2,
      where: {
        address_in_event: {
          some: { address: '0x6306395B37120b1114EF08ee160f7C2f3a263558' },
        },
      },
      orderBy: { blockNumber: 'desc' },
      include: {
        address_in_event: {
          select: { address: true, isEventEmitterAddress: true },
        },
      },
    });
  });

  it('should throw an error if the address is invalid', async () => {
    const invalidAddresses = [
      '0x1234567890abcdef1234567890abcdef1234567',
      '1234567890abcdef1234567890abcdef12345678',
      '0xGHIJKLMNOPQRSTUVWXYZ1234567890abcdef12',
      '',
      null,
      undefined,
    ];

    for (const address of invalidAddresses) {
      await expect(
        service.getEventsByAddress(address as string, 2),
      ).rejects.toThrow(BadRequestException);
    }
  });

  it('should return empty response when no events exist', async () => {
    (prismaMock.event.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getEventsByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
    );

    expect(result).toEqual({
      pagination: { nextCursor: null, take: 2 },
      data: [],
    });
  });

  it('should throw an error for invalid take values', async () => {
    await expect(
      service.getEventsByAddress(
        '0x6306395B37120b1114EF08ee160f7C2f3a263558',
        -1,
      ),
    ).rejects.toThrow('Invalid "take" value: -1. Must be a positive integer.');
  });

  it('should return events with pagination and cursor', async () => {
    const mockEvents = [
      {
        blockNumber: 50,
        timestamp: 1700000002,
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
        blockNumber: 49,
        timestamp: 1700000003,
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
      51,
    );

    expect(result.pagination).toEqual({ nextCursor: 49, take: 2 });
  });

  it('should return transfer events for a valid hash', async () => {
    const mockEvents = [
      {
        blockNumber: 100,
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
      '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
      2,
    );

    expect(result.pagination).toEqual({ nextCursor: 100, take: 2 });
    expect(result.data[0].contrant_detail.name).toBe('Token');
    expect(result.data[0].contrant_detail.symbol).toBe('TKN');
  });

  it('should throw an error if the hash is invalid', async () => {
    const invalidHashes = [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde',
      '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
      '',
      null,
      undefined,
    ];

    for (const hash of invalidHashes) {
      await expect(
        service.getTransfersEventByTxHashOrAddress(hash as string, 2),
      ).rejects.toThrow(BadRequestException);
    }
  });

  it('should return empty response when no transfer events exist', async () => {
    (prismaMock.event.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getTransfersEventByTxHashOrAddress(
      '0x00ca0f23e0b034b0ca0b6ba31530b5e86e6c499985d88cadc6d7d24be5bca35b',
      2,
    );

    expect(result).toEqual({
      pagination: { nextCursor: null, take: 2 },
      data: [],
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
    ).rejects.toThrow('Failed to fetch blocks: Database error');
  });
});
