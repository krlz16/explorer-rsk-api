import { Test, TestingModule } from '@nestjs/testing';
import { BalancesService } from './balances.service';
import { PrismaService } from 'src/prisma.service';

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
        blockNumber: 100,
        timestamp: 1738848907,
        balance: '0x29704b3d6f90a6f4',
      },
      {
        blockNumber: 99,
        timestamp: 1738848874,
        balance: '0x98e215b31ddde',
      },
    ];

    const formattedBalances = [
      {
        blockNumber: 100,
        timestamp: '1738848907',
        balance: 2.985969280183478004,
      },
      {
        blockNumber: 99,
        timestamp: '1738848874',
        balance: 0.002689548705455582,
      },
    ];

    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue(mockBalances);

    const result = await service.getBalanceByAddress('0xAddress', 2);

    expect(result.pagination).toEqual({
      nextCursor: 99,
      take: 2,
    });
    expect(parseFloat(result.data[0].balance)).toBeCloseTo(
      formattedBalances[0].balance,
      15,
    );
    expect(parseFloat(result.data[1].balance)).toBeCloseTo(
      formattedBalances[1].balance,
      15,
    );

    expect(prismaMock.balance.findMany).toHaveBeenCalledWith({
      take: 2,
      where: { address: '0xAddress' },
      orderBy: { blockNumber: 'desc' },
      select: expect.any(Object),
    });
  });

  it('should return empty response when no balances exist', async () => {
    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getBalanceByAddress('0xAddress', 2);

    expect(result).toEqual({
      pagination: { nextCursor: null, take: 2 },
      data: [],
    });

    expect(prismaMock.balance.findMany).toHaveBeenCalledWith({
      take: 2,
      where: { address: '0xAddress' },
      orderBy: { blockNumber: 'desc' },
      select: expect.any(Object),
    });
  });

  it('should throw an error for invalid take values', async () => {
    await expect(service.getBalanceByAddress('0xAddress', -1)).rejects.toThrow(
      'Invalid "take" value: -1. Must be a positive integer.',
    );
  });

  it('should return balances with pagination and cursor', async () => {
    const mockBalances = [
      {
        blockNumber: 50,
        timestamp: 1700000002,
        balance: '0xA1B2C3D4E5F67890',
      },
      {
        blockNumber: 49,
        timestamp: 1700000003,
        balance: '0x1234567890ABCDEF',
      },
    ];

    const expectedBalances = [
      {
        blockNumber: 50,
        timestamp: '1700000002',
        balance: 11.479403,
      },
      {
        blockNumber: 49,
        timestamp: '1700000003',
        balance: 1.30555745,
      },
    ];

    (prismaMock.balance.findMany as jest.Mock).mockResolvedValue(mockBalances);

    const result = await service.getBalanceByAddress('0xAddress', 2, 51);

    expect(result.pagination).toEqual({ nextCursor: 49, take: 2 });

    expect(parseFloat(result.data[0].balance)).toBeCloseTo(
      expectedBalances[0].balance,
      15,
    );
    expect(parseFloat(result.data[1].balance)).toBeCloseTo(
      expectedBalances[1].balance,
      15,
    );

    expect(prismaMock.balance.findMany).toHaveBeenCalledWith({
      take: 2,
      where: { address: '0xAddress', blockNumber: { lt: 51 } },
      orderBy: { blockNumber: 'desc' },
      select: expect.any(Object),
    });
  });

  it('should throw an error when Prisma query fails', async () => {
    (prismaMock.balance.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.getBalanceByAddress('0xAddress', 2)).rejects.toThrow(
      'Failed to fetch balances by address: Database error',
    );
  });
});
