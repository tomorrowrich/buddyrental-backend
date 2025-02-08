import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CredentialsController);
  }
}
