import { PrismaService } from '@app/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Chat, ChatMessage, ChatMessageStatus } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getChatById(id: string): Promise<Chat> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async createChat(userId: string, buddyId: string): Promise<Chat> {
    if (!buddyId || !userId) {
      throw new BadRequestException('Buddy ID and User ID are required');
    }

    const existedChat = await this.prisma.chat.findFirst({
      where: {
        OR: [
          { buddyId, customerId: userId },
          { buddyId: userId, customerId: buddyId },
        ],
      },
    });

    if (existedChat) {
      return existedChat;
    }
    const chat = await this.prisma.chat.create({
      data: {
        buddyId,
        customerId: userId,
      },
    });

    return chat;
  }

  async getChats(userId: string): Promise<Chat[]> {
    return await this.prisma.chat.findMany({
      where: {
        OR: [{ buddyId: userId }, { customerId: userId }],
      },
      include: {
        ChatMessage: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getHistory(
    userId: string,
    chatId: string,
    limit: number,
    skip: number,
  ): Promise<ChatMessage[]> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        OR: [{ buddyId: userId }, { customerId: userId }],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.buddyId !== userId && chat.customerId !== userId) {
      throw new ForbiddenException('You are not involved in this chat');
    }

    return await this.prisma.chatMessage.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    });
  }

  async createMessage(
    chatId: string,
    senderId: string,
    content: string,
    meta: {
      id: string;
      timestamp: Date;
      type: 'text' | 'image' | 'appointment' | 'file';
      content: string;
    },
  ): Promise<{ message: ChatMessage; sendto: string }> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        OR: [{ buddyId: senderId }, { customerId: senderId }],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content,
        meta: {
          id: meta.id,
          timestamp: meta.timestamp,
          type: meta.type,
          content: meta.content,
        },
        status: ChatMessageStatus.WAITING,
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        userId: chat.buddyId === senderId ? chat.customerId : chat.buddyId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message, sendto: user.userId };
  }

  async readMessage(chatId: string, messageId: string): Promise<ChatMessage> {
    return await this.prisma.chatMessage.update({
      where: {
        id: messageId,
        chatId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async updateMessageStatus(
    messageId: string,
    status: ChatMessageStatus,
  ): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return await this.prisma.chatMessage.update({
      where: {
        id: messageId,
      },
      data: {
        status,
      },
    });
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        OR: [{ customerId: userId }, { buddyId: userId }],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    await this.prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: chat.buddyId === userId ? chat.customerId : chat.buddyId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: ChatMessageStatus.READ,
      },
    });

    return true;
  }
}
