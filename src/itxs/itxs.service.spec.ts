import { Test, TestingModule } from '@nestjs/testing';
import { ItxsService } from './itxs.service';

describe('ItxsService', () => {
  let service: ItxsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItxsService],
    }).compile();

    service = module.get<ItxsService>(ItxsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
