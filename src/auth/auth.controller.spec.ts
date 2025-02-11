import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import mockConfig from '@app/config/mock.config';
import { UsersService } from '@app/users/users.service';
import { PrismaService } from '@app/prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mockConfig],
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, UsersService, PrismaService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
