import { PrismaService } from '@app/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Chat, ChatMessage, ChatMessageStatus } from '@prisma/client';
import { ChatMessageMeta } from './chat.type';

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

  async getChatSendto(chatId: string, senderId: string): Promise<string> {
    const chat = await this.getChatById(chatId);
    if (chat.customerId === senderId) {
      const userId = await this.prisma.user
        .findFirst({
          where: {
            buddy: {
              buddyId: chat.buddyId,
            },
          },
          select: {
            userId: true,
          },
        })
        .then((user) => user && user.userId);
      if (userId) {
        return userId;
      }
      throw new NotFoundException('User not found');
    }
    return chat.customerId;
  }

  async createChat(userId: string, buddyId: string): Promise<Chat> {
    if (!buddyId || !userId) {
      throw new BadRequestException('Buddy ID and User ID are required');
    }

    const existedChat = await this.prisma.chat.findFirst({
      where: {
        buddyId: buddyId,
        customerId: userId,
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

  async getChats(userId: string, take = 10, skip = 0) {
    const query = await this.prisma.chat.findMany({
      where: {
        OR: [{ customerId: userId }, { buddy: { userId: userId } }],
      },
      include: {
        ChatMessage: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
        buddy: {
          select: {
            user: {
              select: {
                userId: true,
                displayName: true,
                profilePicture: true,
              },
            },
          },
        },
        customer: {
          select: {
            userId: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
      take,
      skip,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const data = query.map(({ buddy, customer, ...chat }) => ({
      ...chat,
      buddy: buddy.user || null,
      customer: customer || null,
    }));

    const totalCount = await this.prisma.chat.count({
      where: {
        OR: [{ customerId: userId }, { buddy: { userId: userId } }],
      },
    });

    return { data, totalCount };
  }

  async getHistory(userId: string, chatId: string, take: number, skip: number) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        OR: [{ customerId: userId }, { buddy: { userId: userId } }],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.buddyId !== userId && chat.customerId !== userId) {
      throw new ForbiddenException('You are not involved in this chat');
    }

    const data = await this.prisma.chatMessage.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      omit: {
        chatId: true,
        updatedAt: true,
        deletedAt: true,
      },
      take: take,
      skip: skip,
    });

    const totalCount = await this.prisma.chatMessage.count({
      where: {
        chatId,
      },
    });

    return { data, totalCount };
  }

  async createMessage(
    chatId: string,
    senderId: string,
    content: string,
    meta: ChatMessageMeta,
  ): Promise<{ message: ChatMessage; sendto: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { userId: senderId },
          {
            buddy: {
              buddyId: senderId,
            },
          },
        ],
      },
      include: {
        buddy: {
          select: {
            buddyId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Sender not found');
    }

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
        senderId: user.userId,
        content,
        meta: {
          metaId: meta.metaId,
          timestamp: meta.timestamp,
          type: meta.type,
          content: meta.content,
        },
        status: ChatMessageStatus.WAITING,
      },
    });

    if (chat.buddyId == user.buddy?.buddyId) {
      const user = await this.prisma.user.findUnique({
        where: {
          userId: chat.customerId,
        },
      });
      if (!user) {
        throw new NotFoundException('Target user not found');
      }
      return { message, sendto: user.userId };
    } else {
      const user = await this.prisma.buddy.findUnique({
        where: {
          buddyId: chat.buddyId,
        },
        select: {
          userId: true,
        },
      });
      if (!user || !user.userId) {
        throw new NotFoundException('Target user not found');
      }
      return { message, sendto: user.userId };
    }
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
