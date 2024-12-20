import { Test, TestingModule } from '@nestjs/testing';
import { ItxsController } from './itxs.controller';

describe('ItxsController', () => {
  let controller: ItxsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItxsController],
    }).compile();

    controller = module.get<ItxsController>(ItxsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
