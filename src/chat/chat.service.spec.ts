import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatMessageStatus } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    chat: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    chatMessage: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChats', () => {
    it('should return chats for a user', async () => {
      const userId = 'user1';
      const mockChats = [
        { id: 'chat1', buddyId: 'user2', customerId: 'user1' },
      ];

      mockPrismaService.chat.findMany.mockResolvedValue(mockChats);

      const result = await service.getChats(userId);

      expect(result).toEqual(mockChats);
      expect(mockPrismaService.chat.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('getHistory', () => {
    it('should return chat messages', async () => {
      const userId = 'user1';
      const chatId = 'chat1';
      const limit = 10;
      const skip = 0;

      const mockChat = { id: chatId, buddyId: 'user2', customerId: userId };
      const mockMessages = [{ id: 'msg1', content: 'Hello' }];

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await service.getHistory(userId, chatId, limit, skip);

      expect(result).toEqual(mockMessages);
      expect(mockPrismaService.chat.findUnique).toHaveBeenCalledWith({
        where: {
          id: chatId,
          OR: [{ buddyId: userId }, { customerId: userId }],
        },
      });
      expect(mockPrismaService.chatMessage.findMany).toHaveBeenCalledWith({
        where: { chatId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(null);

      await expect(service.getHistory('user1', 'chat1', 10, 0)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user not involved in chat', async () => {
      const mockChat = { id: 'chat1', buddyId: 'user2', customerId: 'user3' };
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);

      await expect(service.getHistory('user1', 'chat1', 10, 0)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('createMessage', () => {
    it('should create a message', async () => {
      const chatId = 'chat1';
      const senderId = 'user1';
      const content = 'Hello';
      const meta = {
        id: 'meta1',
        timestamp: new Date(),
        type: 'text' as const,
        content: 'Hello',
      };

      const mockChat = { id: chatId, buddyId: 'user2', customerId: senderId };
      const mockMessage = { id: 'msg1', content, meta };
      const mockUser = { userId: 'user2' };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.create.mockResolvedValue(mockMessage);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.createMessage(
        chatId,
        senderId,
        content,
        meta,
      );

      expect(result).toEqual({ message: mockMessage, sendto: mockUser.userId });
      expect(mockPrismaService.chatMessage.create).toHaveBeenCalledWith({
        data: {
          chatId,
          senderId,
          content,
          meta,
          status: ChatMessageStatus.WAITING,
        },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(null);

      await expect(
        service.createMessage('chat1', 'user1', 'Hello', {
          id: 'meta1',
          timestamp: new Date(),
          type: 'text',
          content: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const mockChat = { id: 'chat1', buddyId: 'user2', customerId: 'user1' };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.create.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createMessage('chat1', 'user1', 'Hello', {
          id: 'meta1',
          timestamp: new Date(),
          type: 'text',
          content: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('readMessage', () => {
    it('should mark a message as read', async () => {
      const chatId = 'chat1';
      const messageId = 'msg1';
      const mockMessage = { id: messageId, readAt: new Date() };

      mockPrismaService.chatMessage.update.mockResolvedValue(mockMessage);

      const result = await service.readMessage(chatId, messageId);

      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.chatMessage.update).toHaveBeenCalledWith({
        where: { id: messageId, chatId },
        data: { readAt: expect.any(Date) as Date },
      });
    });
  });

  describe('updateMessageStatus', () => {
    it('should update message status', async () => {
      const messageId = 'msg1';
      const status = ChatMessageStatus.READ;
      const mockMessage = { id: messageId, status };

      mockPrismaService.chatMessage.findUnique.mockResolvedValue(mockMessage);
      mockPrismaService.chatMessage.update.mockResolvedValue(mockMessage);

      const result = await service.updateMessageStatus(messageId, status);

      expect(result).toEqual(mockMessage);
      expect(mockPrismaService.chatMessage.update).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { status },
      });
    });

    it('should throw NotFoundException if message not found', async () => {
      mockPrismaService.chatMessage.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMessageStatus('msg1', ChatMessageStatus.READ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark all messages as read', async () => {
      const chatId = 'chat1';
      const userId = 'user1';
      const mockChat = { id: chatId, buddyId: 'user2', customerId: userId };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markMessagesAsRead(chatId, userId);

      expect(result).toEqual(true);
      expect(mockPrismaService.chatMessage.updateMany).toHaveBeenCalledWith({
        where: {
          chatId,
          senderId: 'user2',
          readAt: null,
        },
        data: {
          readAt: expect.any(Date) as Date,
          status: ChatMessageStatus.READ,
        },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(null);

      await expect(
        service.markMessagesAsRead('chat1', 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
