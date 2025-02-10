import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CredentialsService } from '@app/credentials/credentials.service';
import { RegisterDto } from './dtos/register.dto';
import { Credential } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let credentialsService: CredentialsService;

  const mockDatabase: { users: Credential[] } = { users: [] };

  const mockCredentialsService = {
    create: jest.fn((registerDto: RegisterDto) => {
      const newMockUser = {
        userId: (mockDatabase.users.length + 1).toString(),
        email: registerDto.email,
        password: registerDto.password,
        verified: false,
      };
      mockDatabase.users.push(newMockUser);
      return newMockUser;
    }),
    findAll: jest.fn(() => {
      return mockDatabase.users;
    }),
    findOne: jest.fn((email: string) => {
      const mockUser = mockDatabase.users.find(
        (element) => element.email === email,
      );
      if (!mockUser) return null;
      return mockUser;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule, ConfigModule],
      providers: [
        AuthService,
        {
          provide: CredentialsService,
          useValue: mockCredentialsService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    credentialsService = module.get<CredentialsService>(CredentialsService);
  });

  afterEach(() => {
    mockDatabase.users = [];
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a new user', async () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'hashedpassword',
    };
    const newUser = await credentialsService.create(registerDto);

    expect(newUser).toEqual({
      userId: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      verified: false,
    });

    expect(mockDatabase.users.length).toBe(1);
    expect(mockDatabase.users[0]).toEqual(newUser);
  });

  it('should find all users', async () => {
    mockDatabase.users.push(
      {
        userId: '1',
        email: 'user1@example.com',
        password: 'pass1',
        verified: false,
      },
      {
        userId: '2',
        email: 'user2@example.com',
        password: 'pass2',
        verified: true,
      },
    );

    const users = await credentialsService.findAll();

    expect(users).toHaveLength(2);
    expect(users).toEqual(mockDatabase.users);
  });

  it('should find a user by email', async () => {
    mockDatabase.users.push({
      userId: '1',
      email: 'findme@example.com',
      password: 'pass123',
      verified: true,
    });

    const user = await credentialsService.findOne('findme@example.com');

    expect(user).toEqual({
      userId: '1',
      email: 'findme@example.com',
      password: 'pass123',
      verified: true,
    });
  });

  it('should return null if user is not found', async () => {
    const user = await credentialsService.findOne('notfound@example.com');
    expect(user).toBeNull();
  });
});
