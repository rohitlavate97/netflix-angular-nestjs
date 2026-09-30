import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return platform operational status', () => {
      const response = appController.getRoot();
      expect(response.success).toBe(true);
      expect(response.data?.name).toBe('Netflix Clone Streaming API');
      expect(response.data?.status).toBe('operational');
    });
  });
});
