import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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
    findOne: jest.fn((email: string) => {
      const mockUser = mockDatabase.users.find(
        (element) => element.email === email,
      );
      if (!mockUser) return null;
      return mockUser;
    }),
  };
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
      imports: [ConfigModule],
      providers: [
        AuthService,
        {
          provide: CredentialsService,
          useValue: mockCredentialsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    credentialsService = module.get<CredentialsService>(CredentialsService);
    mockDatabase.users = [];
  });

  //definition and mocking data is implied if credentialsService passes the test suite
  //and all following tests fail, so both tests are now unnecessary

  it('should register a new credential', async () => {
    const noUser = await credentialsService.findOne('test@example.com');
    expect(noUser).toBeNull();

    const newUser = await authService.register({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(newUser).toEqual({
      userId: '1',
      email: 'test@example.com',
      password: 'password123',
      verified: false,
    });
    expect(jest.spyOn(credentialsService, 'create')).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should throw an error when registering an existing credential', async () => {
    mockDatabase.users.push({
      userId: '1',
      email: 'test@example.com',
      password: 'password123',
      verified: false,
    });

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Duplicate credential');
    expect(jest.spyOn(credentialsService, 'findOne')).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(mockDatabase.users.length).toBe(1); // Should NOT create a new user
  });

  it('should login a user if credentials are correct', async () => {
    mockDatabase.users.push({
      userId: '1',
      email: 'test@example.com',
      password: 'password123',
      verified: false,
    });

    const res = await authService.signin({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(jest.spyOn(credentialsService, 'findOne')).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should throw an error if login fails', async () => {
    await expect(
      authService.signin({
        email: 'wrong@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid email or password');

    expect(jest.spyOn(credentialsService, 'findOne')).toHaveBeenCalledWith(
      'wrong@example.com',
    );
  });

  it('should check verified of a credential', async () => {
    mockDatabase.users.push({
      userId: '1',
      email: 'test@example.com',
      password: 'password123',
      verified: false,
    });
    const status = await authService.verifyStatus('test@example.com');

    expect(status).toBe(false);
  });
});
