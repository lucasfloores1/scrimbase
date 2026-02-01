import { Test, TestingModule } from '@nestjs/testing';
import { StratsController } from './strats.controller';

describe('StratsController', () => {
  let controller: StratsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StratsController],
    }).compile();

    controller = module.get<StratsController>(StratsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
