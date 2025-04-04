import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';
import { UsersModule } from '@app/users/users.module';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(ChatController);
  }
}
