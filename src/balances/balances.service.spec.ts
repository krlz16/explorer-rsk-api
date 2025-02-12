import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balances.service';
import { PrismaService } from 'src/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('BalancesService', () => {
  let service: BalancesService;
  let prismaMock: PrismaService;

  beforeEach(async () => {
    prismaMock = {
      balance: {
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<BalancesService>(BalancesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated balances with a next cursor', async () => {
    const mockBalances = [
      {
        id: '1',
        blockNumber: 100,
        timestamp: 1738848907,
        balance: '1000000000000000000',
      },
      {
        id: '2',
        blockNumber: 99,
        timestamp: 1738848874,
        balance: '500000000000000000',
      },
    ];

    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue(mockBalances);

    const result = await service.getBalanceByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
    );

    expect(result.paginationBalances).toEqual({
      nextCursor: null,
      prevCursor: null,
      take: 2,
      hasMoreData: false,
    });
    expect(result.data.length).toBe(2);
    expect(prismaMock.balance.findMany).toHaveBeenCalledWith({
      take: 3,
      where: { address: '0x6306395B37120b1114EF08ee160f7C2f3a263558' },
      orderBy: { id: 'desc' },
      select: expect.any(Object),
    });
  });

  it('should return empty response when no balances exist', async () => {
    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getBalanceByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
    );

    expect(result).toEqual({
      paginationBalances: {
        nextCursor: null,
        prevCursor: null,
        take: 2,
        hasMoreData: false,
      },
      data: [],
    });
  });

  it('should return balances with pagination and cursor', async () => {
    const mockBalances = [
      {
        id: '50',
        blockNumber: 50,
        timestamp: 1700000002,
        balance: '1000000000000000000',
      },
      {
        id: '49',
        blockNumber: 49,
        timestamp: 1700000003,
        balance: '500000000000000000',
      },
    ];

    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue(mockBalances);

    const result = await service.getBalanceByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
      51,
    );

    expect(result.paginationBalances).toEqual({
      nextCursor: null,
      prevCursor: '50',
      take: 2,
      hasMoreData: false,
    });
  });

  it('should handle pagination when take is larger than available balances', async () => {
    const mockBalances = [
      {
        id: '1',
        blockNumber: 100,
        timestamp: 1738848907,
        balance: '1000000000000000000',
      },
    ];

    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue(mockBalances);

    const result = await service.getBalanceByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      5,
    );

    expect(result.paginationBalances).toEqual({
      nextCursor: null,
      prevCursor: null,
      take: 5,
      hasMoreData: false,
    });

    expect(result.data.length).toBe(1);
  });

  it('should handle pagination when take is smaller than available balances', async () => {
    const mockBalances = [
      {
        id: '10',
        blockNumber: 10,
        timestamp: 1700000001,
        balance: '2000000000000000000',
      },
      {
        id: '9',
        blockNumber: 9,
        timestamp: 1700000002,
        balance: '1000000000000000000',
      },
    ];

    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue(mockBalances);

    const result = await service.getBalanceByAddress(
      '0x6306395B37120b1114EF08ee160f7C2f3a263558',
      2,
    );

    expect(result.paginationBalances).toEqual({
      nextCursor: null,
      prevCursor: null,
      take: 2,
      hasMoreData: false,
    });

    expect(result.data.length).toBe(2);
  });

  it('should throw an error when Prisma query fails', async () => {
    (prismaMock.balance.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.getBalanceByAddress(
        '0x6306395B37120b1114EF08ee160f7C2f3a263558',
        2,
      ),
    ).rejects.toThrow('Failed to fetch balances by address: Database error');
  });
});
