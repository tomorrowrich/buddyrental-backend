import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { MailService } from '@app/mail/mail.service';

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [UsersService, ConfigService, MailService],
  exports: [UsersService, MailService],
  controllers: [UsersController],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(UsersController);
  }
}
