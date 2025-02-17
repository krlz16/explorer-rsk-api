import { Test, TestingModule } from '@nestjs/testing';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';

describe('BalancesController', () => {
  let controller: BalancesController;
  let balanceServiceMock: Partial<BalancesService>;

  beforeEach(async () => {
    balanceServiceMock = {
      getBalanceByAddress: jest.fn().mockResolvedValue({
        paginationBalances: { nextCursor: null, prevCursor: null, take: 10 },
        data: [{ id: '1', blockNumber: 100, balance: '0.5' }],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalancesController],
      providers: [{ provide: BalancesService, useValue: balanceServiceMock }],
    }).compile();

    controller = module.get<BalancesController>(BalancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated balances for an address', async () => {
    const result = await controller.getBalanceByAddress(
      '0x1234567890abcdef1234567890abcdef12345678',
      10,
      undefined,
    );

    expect(result).toEqual({
      paginationBalances: { nextCursor: null, prevCursor: null, take: 10 },
      data: [{ id: '1', blockNumber: 100, balance: '0.5' }],
    });

    expect(balanceServiceMock.getBalanceByAddress).toHaveBeenCalledWith(
      '0x1234567890abcdef1234567890abcdef12345678',
      10,
      undefined,
    );
  });
});
