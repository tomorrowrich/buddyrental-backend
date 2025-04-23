import { MailService } from '@app/mail/mail.service';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { PrismaModule } from '@app/prisma/prisma.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
