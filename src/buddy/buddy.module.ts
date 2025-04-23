import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BuddyController } from './buddy.controller';
import { BuddyService } from './buddy.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { AuthModule } from '@app/auth/auth.module';
import { PaymentService } from '@app/payment/payment.service';
import { StripeModule } from '@app/stripe/stripe.module';

@Module({
  imports: [JwtModule, AuthModule, StripeModule],
  controllers: [BuddyController],
  providers: [BuddyService, PrismaService, PaymentService],
  exports: [BuddyService],
})
export class BuddyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(BuddyController);
  }
}
