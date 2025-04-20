import { AuthModule } from '@app/auth/auth.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { PrismaModule } from '@app/prisma/prisma.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeModule } from '@app/stripe/stripe.module';

@Module({
  imports: [PrismaModule, AuthModule, StripeModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(PaymentController);
  }
}
