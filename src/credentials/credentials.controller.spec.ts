import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { PrismaModule } from '@app/prisma/prisma.module';

describe('CredentialsController', () => {
  let controller: CredentialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [CredentialsController],
      providers: [CredentialsService],
    }).compile();

    controller = module.get<CredentialsController>(CredentialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
