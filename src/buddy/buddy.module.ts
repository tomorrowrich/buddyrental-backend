import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BuddyController } from './buddy.controller';
import { BuddyService } from './buddy.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [BuddyController],
  providers: [BuddyService, PrismaService],
  exports: [BuddyService],
})
export class BuddyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(BuddyController);
  }
}
