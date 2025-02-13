import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';

@Module({
  imports: [JwtModule],
  controllers: [ReservationController],
  providers: [ReservationService, PrismaService],
})
export class ReservationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(ReservationController);
  }
}
