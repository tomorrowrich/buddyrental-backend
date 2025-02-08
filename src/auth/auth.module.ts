import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { CredentialsModule } from '@app/credentials/credentials.module';
import { UsersModule } from '@app/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [CredentialsModule, UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
