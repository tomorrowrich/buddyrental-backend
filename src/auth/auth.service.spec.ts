import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigModule } from '@nestjs/config';
import config from '@app/config';
import { UsersService } from '@app/users/users.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { randomUUID } from 'node:crypto';
import { ForbiddenException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  const mockDatabase: { users: User[] } = { users: [] };
  const mockJwtService = {
    sign: jest
      .fn()
      .mockImplementation(
        (_payload: string | object | Buffer, _options?: JwtSignOptions) => {
          return 'token';
        },
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
      ],
      providers: [
        AuthService,
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockImplementation((data: User) => {
                mockDatabase.users.push(data);
                return { ...data, userId: randomUUID() };
              }),
              findFirst: jest.fn().mockImplementation((data: Partial<User>) => {
                return mockDatabase.users.find(
                  (user) =>
                    user.email === data.email || user.userId === data.userId,
                );
              }),

              findMany: jest.fn().mockImplementation(() => {
                return mockDatabase.users;
              }),
              softDelete: jest
                .fn()
                .mockImplementation((data: Partial<User>) => {
                  mockDatabase.users = mockDatabase.users.map((user) => {
                    if (user.userId === data.userId) {
                      return { ...user, deletedAt: new Date() };
                    }
                    return user;
                  });
                }),
              findDeleted: jest.fn().mockImplementation(() => {
                return mockDatabase.users.filter((user) => user.deletedAt);
              }),
            },
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    mockDatabase.users = [];
  });

  afterEach(() => {
    mockDatabase.users = [];
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        dateOfBirth: '2000-01-01',
        address: '123 Test St',
        firstName: 'Test',
        city: 'Test City',
        lastName: 'User',
        gender: 'MALE',
        phone: '1234567890',
        citizenId: '1234567890',
        postalCode: '12345',
        nickname: 'testuser',
        profilePicture: 'test.jpg',
      };
      const userId = await authService.register(registerDto);
      expect(userId).toBeDefined();
    });

    it('should not register a user with duplicate email', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        dateOfBirth: '2000-01-01',
        address: '123 Test St',
        firstName: 'Test',
        city: 'Test City',
        lastName: 'User',
        gender: 'MALE',
        phone: '1234567890',
        citizenId: '1234567890',
        postalCode: '12345',
        nickname: 'testuser',
        profilePicture: 'test.jpg',
      };
      const _oldUser = await authService.register(registerDto);
      const nextRegisterDto: RegisterDto = {
        email: 'test@example.com',
        password: 'newPassword',
        dateOfBirth: '2000-01-02',
        address: '124 Test St',
        firstName: 'Next-Test',
        city: 'Test Town',
        lastName: 'Mext-User',
        gender: 'FEMALE',
        phone: '0987654321',
        citizenId: '0987654321',
        postalCode: '54321',
        nickname: 'newtestuser',
        profilePicture: 'test.jpg',
      };
      await expect(authService.register(nextRegisterDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not register a user with duplicate phone number', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        dateOfBirth: '2000-01-01',
        address: '123 Test St',
        firstName: 'Test',
        city: 'Test City',
        lastName: 'User',
        gender: 'MALE',
        phone: '1234567890',
        citizenId: '1234567890',
        postalCode: '12345',
        nickname: 'testuser',
        profilePicture: 'test.jpg',
      };
      const _oldUser = await authService.register(registerDto);
      const nextRegisterDto: RegisterDto = {
        email: 'newtest@example.com',
        password: 'newPassword',
        dateOfBirth: '2000-01-02',
        address: '124 Test St',
        firstName: 'Next-Test',
        city: 'Test Town',
        lastName: 'Mext-User',
        gender: 'FEMALE',
        phone: '1234567890',
        citizenId: '0987654321',
        postalCode: '54321',
        nickname: 'newtestuser',
        profilePicture: 'test.jpg',
      };
      await expect(authService.register(nextRegisterDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not register a user with duplicate citizen id', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        dateOfBirth: '2000-01-01',
        address: '123 Test St',
        firstName: 'Test',
        city: 'Test City',
        lastName: 'User',
        gender: 'MALE',
        phone: '1234567890',
        citizenId: '1234567890',
        postalCode: '12345',
        nickname: 'testuser',
        profilePicture: 'test.jpg',
      };
      const _oldUser = await authService.register(registerDto);
      const nextRegisterDto: RegisterDto = {
        email: 'newtest@example.com',
        password: 'newPassword',
        dateOfBirth: '2000-01-02',
        address: '124 Test St',
        firstName: 'Next-Test',
        city: 'Test Town',
        lastName: 'Mext-User',
        gender: 'FEMALE',
        phone: '0987654321',
        citizenId: '1234567890',
        postalCode: '54321',
        nickname: 'newtestuser',
        profilePicture: 'test.jpg',
      };
      await expect(authService.register(nextRegisterDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
