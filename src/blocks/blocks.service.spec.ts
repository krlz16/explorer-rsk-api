import { Test, TestingModule } from '@nestjs/testing';
import { BlocksService } from './blocks.service';
import { PrismaService } from 'src/prisma.service';
import { BlockParserService } from 'src/common/parsers/block-parser.service';

describe('BlocksService', () => {
  let service: BlocksService;
  let prismaMock: PrismaService;
  let blockParserMock: BlockParserService;

  beforeEach(async () => {
    prismaMock = {
      block: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    } as unknown as PrismaService;

    blockParserMock = {
      formatBlock: jest.fn(),
    } as unknown as BlockParserService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: BlockParserService,
          useValue: blockParserMock,
        },
      ],
    }).compile();

    service = module.get<BlocksService>(BlocksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST: getBlocks() should return paginated blocks
  it('should return paginated blocks with a next and prev cursor', async () => {
    const mockBlocks = [
      {
        id: '1',
        number: 100,
        hash: '0xabc',
        miner: '0xminer',
        size: 2000,
        timestamp: 1234567890,
        difficulty: '0x1',
        totalDifficulty: '0x2',
        uncles: '[]',
        transactions: '[]',
      },
      {
        id: '2',
        number: 99,
        hash: '0xdef',
        miner: '0xminer',
        size: 1500,
        timestamp: 1234567880,
        difficulty: '0x1',
        totalDifficulty: '0x2',
        uncles: '[]',
        transactions: '[]',
      },
      {
        id: '3',
        number: 98,
        hash: '0xdef',
        miner: '0xminer',
        size: 1500,
        timestamp: 1234567870,
        difficulty: '0x1',
        totalDifficulty: '0x2',
        uncles: '[]',
        transactions: '[]',
      },
      {
        id: '4',
        number: 97,
        hash: '0xdef',
        miner: '0xminer',
        size: 1500,
        timestamp: 1234567860,
        difficulty: '0x1',
        totalDifficulty: '0x2',
        uncles: '[]',
        transactions: '[]',
      },
      {
        id: '5',
        number: 96,
        hash: '0xdef',
        miner: '0xminer',
        size: 1500,
        timestamp: 1234567850,
        difficulty: '0x1',
        totalDifficulty: '0x2',
        uncles: '[]',
        transactions: '[]',
      },
      {
        id: '6',
        number: 95,
        hash: '0xdef',
        miner: '0xminer',
        size: 1500,
        timestamp: 1234567840,
        difficulty: '0x1',
        totalDifficulty: '0x2',
        uncles: '[]',
        transactions: '[]',
      },
    ];

    const formattedBlocks = [
      { id: '1', number: 100, hash: '0xabc' },
      { id: '2', number: 99, hash: '0xdef' },
      { id: '3', number: 98, hash: '0xdef' },
      { id: '4', number: 97, hash: '0xdef' },
      { id: '5', number: 96, hash: '0xdef' },
      { id: '6', number: 95, hash: '0xdef' },
    ];

    (prismaMock.block.findMany as jest.Mock).mockResolvedValue(mockBlocks);
    (blockParserMock.formatBlock as jest.Mock).mockReturnValue(formattedBlocks);

    const result = await service.getBlocks(2, 98);

    expect(result).toEqual({
      paginationData: {
        nextCursor: 95,
        prevCursor: 100,
        take: 2,
        hasMoreData: true,
      },
      data: formattedBlocks,
    });

    expect(prismaMock.block.findMany).toHaveBeenCalledWith({
      take: 4,
      cursor: { number: 98 },
      skip: 1,
      orderBy: { number: 'desc' },
      select: expect.any(Object),
    });
  });

  // ✅ TEST: getBlocks() should return empty response when no blocks exist
  it('should return empty response when no blocks exist', async () => {
    (prismaMock.block.findMany as jest.Mock).mockResolvedValue([]);
    (blockParserMock.formatBlock as jest.Mock).mockResolvedValue([]);

    const result = await service.getBlocks(2);

    expect(result).toEqual({
      paginationData: { nextCursor: null, prevCursor: null, take: 2 },
      data: [],
    });

    expect(prismaMock.block.findMany).toHaveBeenCalledWith({
      take: 4,
      orderBy: { number: 'desc' },
      select: expect.any(Object),
    });
  });

  // ✅ TEST: getBlocks() should throw an error for negative take values without a cursor
  it('should throw an error for invalid take values', async () => {
    await expect(service.getBlocks(-1)).rejects.toThrow(
      'Cannot paginate backward without a cursor.',
    );
  });

  // ✅ TEST: getBlock() should return a block by number
  it('should return a block by number', async () => {
    const mockBlock = {
      id: '1',
      number: 10,
      transactions: '[]',
      hash: '0xabc',
      miner: '0xminer',
      size: 100,
      timestamp: 1700000000,
      difficulty: '0x1',
      totalDifficulty: '0x10',
      uncles: '[]',
    };

    (prismaMock.block.findFirst as jest.Mock).mockResolvedValue(mockBlock);
    (blockParserMock.formatBlock as jest.Mock).mockReturnValue([mockBlock]);

    const result = await service.getBlock(10);

    expect(result).toEqual({
      data: mockBlock,
      navigation: { prev: 10, next: mockBlock.number + 1 },
    });
  });

  // ✅ TEST: getBlock() should return a block by hash
  it('should return a block by hash', async () => {
    const mockBlock = {
      id: '1',
      number: 10,
      transactions: '[]',
      hash: '0x5a5ff4628a01ccc79909eaea7004bc90620eefd1374f61c5c41928f780ad47df',
      miner: '0xminer',
      size: 100,
      timestamp: 1700000000,
      difficulty: '0x1',
      totalDifficulty: '0x10',
      uncles: '[]',
    };

    (prismaMock.block.findFirst as jest.Mock).mockResolvedValue(mockBlock);
    (blockParserMock.formatBlock as jest.Mock).mockReturnValue([mockBlock]);

    const result = await service.getBlock(
      '0x5a5ff4628a01ccc79909eaea7004bc90620eefd1374f61c5c41928f780ad47df',
    );

    expect(result).toEqual({
      data: mockBlock,
      navigation: { prev: 10, next: 11 },
    });
  });

  it('should return block details with navigation', async () => {
    const mockBlock = {
      id: '1',
      number: 100,
      hash: '0xabc',
      miner: '0xminer',
      size: 2000,
      timestamp: 1234567890,
      difficulty: '0x1',
      totalDifficulty: '0x2',
      uncles: '[]',
      transactions: '[]',
    };

    const prevBlock = {
      number: 99,
      timestamp: 1234567880,
    };

    const formattedBlock = {
      id: '1',
      number: 100,
      hash: '0xabc',
    };

    (prismaMock.block.findFirst as jest.Mock)
      .mockResolvedValueOnce(mockBlock) // First call: Fetch block
      .mockResolvedValueOnce(prevBlock); // Second call: Fetch previous block

    (blockParserMock.formatBlock as jest.Mock).mockReturnValue([
      formattedBlock,
    ]);

    const result = await service.getBlock(100);

    expect(result).toEqual({
      data: formattedBlock,
      navigation: { prev: 99, next: 101 },
    });

    expect(prismaMock.block.findFirst).toHaveBeenCalledTimes(2);
  });

  it('should return null if the block is not found', async () => {
    (prismaMock.block.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.getBlock(10);

    expect(result).toEqual({
      data: null,
    });

    expect(prismaMock.block.findFirst).toHaveBeenCalledTimes(1);
  });
});
