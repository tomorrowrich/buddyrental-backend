import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BuddyController } from './buddy.controller';
import { BuddyService } from './buddy.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { RoleGuard } from '@app/auth/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';

@Module({
  imports: [JwtModule],
  controllers: [BuddyController],
  providers: [BuddyService, PrismaService, RoleGuard],
  exports: [BuddyService],
})
export class BuddyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(BuddyController);
  }
}
