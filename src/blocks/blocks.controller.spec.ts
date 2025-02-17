import { Test, TestingModule } from '@nestjs/testing';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

describe('BlocksController', () => {
  let controller: BlocksController;
  let blockServiceMock: Partial<BlocksService>;

  beforeEach(async () => {
    blockServiceMock = {
      getBlocks: jest.fn().mockResolvedValue({
        paginationBlocks: { nextCursor: null, prevCursor: null, take: 10 },
        data: [{ number: 100, hash: '0xabc' }],
      }),
      getBlock: jest.fn().mockResolvedValue({
        number: 100,
        hash: '0xabc',
        transactions: 5,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [{ provide: BlocksService, useValue: blockServiceMock }],
    }).compile();

    controller = module.get<BlocksController>(BlocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated blocks', async () => {
    const result = await controller.getBlocks(10, undefined);

    expect(result).toEqual({
      paginationBlocks: { nextCursor: null, prevCursor: null, take: 10 },
      data: [{ number: 100, hash: '0xabc' }],
    });

    expect(blockServiceMock.getBlocks).toHaveBeenCalledWith(10, undefined);
  });

  it('should return a block by number or hash', async () => {
    const result = await controller.getBlock('0xabc');

    expect(result).toEqual({
      number: 100,
      hash: '0xabc',
      transactions: 5,
    });

    expect(blockServiceMock.getBlock).toHaveBeenCalledWith('0xabc');
  });
});
