import { corsOptions } from '@app/main';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ChatGatewayAuthPayload,
  ChatMessage,
  ChatMessageMeta,
} from './chat.type';
import { isUUID, validate } from 'class-validator';
import { ChatService } from './chat.service';
import { Chat } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@app/users/users.service';

@WebSocketGateway({
  path: '/api/ws',
  namespace: 'chats',
  cors: corsOptions,
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const authPayload = {
      ...client.handshake.auth,
      ...client.handshake.headers,
    } as ChatGatewayAuthPayload;

    if (authPayload.token && isUUID(authPayload.userid)) {
      return await this.jwtService
        .verifyAsync(authPayload.token)
        .then(async (payload: { sub: string }) => {
          if (payload.sub !== authPayload.userid) return client.disconnect();
          const user = await this.userService.findOne(authPayload.userid);
          if (user) {
            await client.join(`operation-${authPayload.userid}`);
            await client.join(`chat-${authPayload.userid}`);
            return client.emit('connected', { message: 'Connected!' });
          }
        })
        .catch(() => {
          return client.disconnect();
        });
    }
    return client.disconnect();
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: ChatMessage): Promise<string> {
    const chatMessage = new ChatMessage();
    const chatMessageMeta = new ChatMessageMeta();
    chatMessage.trackId = message.trackId;
    chatMessage.chatId = message.chatId;
    chatMessage.senderId = message.senderId;
    chatMessage.content = message.content;

    chatMessageMeta.metaId = message.meta.metaId;
    chatMessageMeta.content = message.meta.content;
    chatMessageMeta.type = message.meta.type;
    chatMessageMeta.timestamp = message.meta.timestamp;

    chatMessage.meta = chatMessageMeta;
    const errors = await validate(chatMessage, {
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return 'INVALID';
    }

    return this.chatService
      .createMessage(
        message.chatId,
        message.senderId,
        message.content,
        message.meta,
      )
      .then(async ({ message: msg, sendto }) => {
        this.server.timeout(500).to(`chat-${sendto}`).emit('message', msg);

        return this.chatService
          .updateMessageStatus(msg.id, 'SENT')
          .then(() => `SENT ${message.trackId}`)
          .catch(() => `WAITING ${message.trackId}`);
      })
      .catch((error: Error) => {
        return `FAILED: ${error.message}`;
      });
  }

  @SubscribeMessage('operation')
  async handleOperation(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const commands = data.split(' ');
    if (commands.length === 2) {
      const [command, chatId] = commands;
      const chat: Chat = await this.chatService.getChatById(chatId);
      if (!chat) {
        return 'FAILED';
      }

      const userId = (client.handshake.auth['userid'] ||
        client.handshake.headers['userid']) as string;

      const sendto = await this.chatService.getChatSendto(chatId, userId);

      console.log(`sendto: ${sendto}`);
      const room = `operation-${sendto}`;
      if (command === 'focus') {
        this.server.to(room).emit('operation', `focus ${chatId}`);
        return 'OK';
      } else if (command === 'unfocus') {
        this.server.to(room).emit('operation', `unfocus ${chatId}`);
        return 'OK';
      } else if (command === 'read') {
        this.server.to(room).emit('operation', `read ${chatId}`);
        await this.chatService.markMessagesAsRead(chatId, client.id);
        return 'OK';
      }
    } else if (commands.length === 3) {
      const [command, chatId, args] = commands;
      const chat: Chat = await this.chatService.getChatById(chatId);
      if (!chat) {
        return 'FAILED';
      }
      const sendto =
        chat.buddyId ===
        (client.handshake.auth['userid'] || client.handshake.headers['userid'])
          ? chat.customerId
          : chat.buddyId;
      if (command === 'typing') {
        this.server
          .to(`operation-${sendto}`)
          .emit('operraion', `typing ${args}`);
        return 'OK';
      }
    }
    return 'FAILED';
  }
}
