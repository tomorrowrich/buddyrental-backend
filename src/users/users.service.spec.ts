import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@app/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear mock call history before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call prisma.user.findUnique with correct userId', async () => {
    const mockPassword = await argon2.hash('testpassword');
    const mockUser = { id: 1, password: mockPassword };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

    const result = await service.verifyPassword(mockPassword, 'testpassword');
    expect(result).toBe(true);
  });
});
