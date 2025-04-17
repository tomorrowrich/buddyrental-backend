import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(NotificationsController);
  }
}
