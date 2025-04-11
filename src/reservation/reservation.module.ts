import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { PrismaService } from '@app/prisma/prisma.service';
import { ScheduleService } from '@app/schedule/schedule.service';
import { AuthModule } from '@app/auth/auth.module';
import { NotificationsModule } from '@app/notifications/notifications.module';

@Module({
  imports: [JwtModule, AuthModule, NotificationsModule],
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService, ScheduleService],
  exports: [ReservationService],
})
export class ReservationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(ReservationController);
  }
}
