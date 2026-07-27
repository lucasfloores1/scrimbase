import { Test, TestingModule } from '@nestjs/testing';
import { StratsService } from './strats.service';

describe('StratsService', () => {
  let service: StratsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StratsService],
    }).compile();

    service = module.get<StratsService>(StratsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
