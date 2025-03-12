import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
