import { corsOptions } from '@app/main';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from './chat.type';
import { validate } from 'class-validator';
import { ChatService } from './chat.service';

@WebSocketGateway({
  path: '/api/ws',
  namespace: 'chats',
  cors: corsOptions,
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log('Event received:', data, client.id);
    return 'OK';
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: ChatMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    console.log('Client:', client.id, message);
    await validate(message, {
      skipMissingProperties: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }).then((errors) => {
      if (errors.length > 0) {
        return 'FAILED';
      }
    });

    const { message: msg, sendto } = await this.chatService.createMessage(
      message.chatId,
      message.senderId,
      message.content,
      message.meta,
    );

    let messageStatus: string = 'WAITING';

    this.server
      .timeout(100)
      .to(sendto)
      .emit('message', msg, async (err: any) => {
        if (!err) {
          await this.chatService.updateMessageStatus(msg.id, 'SENT');
          messageStatus = 'SENT';
        }
      });

    return messageStatus;
  }

  @SubscribeMessage('operation')
  async handleOperation(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const commands = data.split(' ');
    if (commands.length === 2) {
      const [command, chatId] = commands;
      if (command === 'focus') {
        await client.join(chatId);
        return 'OK';
      } else if (command === 'unfocus') {
        await client.leave(chatId);
        return 'OK';
      } else if (command === 'read') {
        await this.chatService.markMessagesAsRead(chatId, client.id);
        return 'OK';
      }
    } else if (commands.length === 3) {
      const [command, chatId, args] = commands;
      if (command === 'typing') {
        client.to(chatId).emit('typing', args);
        return 'OK';
      }
    }
    return 'FAILED';
  }
}
