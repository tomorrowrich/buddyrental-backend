import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ReservationService } from '@app/reservation/reservation.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { PrismaModule } from '@app/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@app/auth/auth.module';
import { NotificationsModule } from '@app/notifications/notifications.module';

@Module({
  imports: [PrismaModule, JwtModule, AuthModule, NotificationsModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, ReservationService, PrismaService],
})
export class ScheduleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(ScheduleController);
  }
}
