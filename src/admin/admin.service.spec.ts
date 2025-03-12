import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersModule } from '@app/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

describe('AdminService', () => {
  let service: AdminService;
  let configService: ConfigService;
  let _jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot(),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AdminService, ConfigService, JwtService],
    }).compile();

    service = module.get<AdminService>(AdminService);
    configService = module.get<ConfigService>(ConfigService);
    _jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should inject ConfigService', () => {
    expect(configService).toBeDefined();
  });
});
