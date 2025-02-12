import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigModule } from '@nestjs/config';
import mockConfig from '@app/config/mock.config';
import { UsersService } from '@app/users/users.service';
import { PrismaService } from '@app/prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  const mockDatabase: { users: User[] } = { users: [] };
  const mockJwtService = {
    sign: jest
      .fn()
      .mockImplementation(
        (payload: { sub: string; email: string }, options?: JwtSignOptions) => {
          const secretString = options?.secret?.toString() || 'sekritsekrit';
          const expiresIn = options?.expiresIn?.toString() || '42069s';
          return (
            payload.sub + payload.email.toUpperCase() + secretString + expiresIn
          );
        },
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mockConfig],
        }),
      ],
      providers: [
        AuthService,
        UsersService,
        PrismaService,
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

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
  });
});
