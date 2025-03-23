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
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    chatMessage: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    buddy: {
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
      const mockTotalCount = 1;

      mockPrismaService.chat.findMany.mockResolvedValue(mockChats);
      mockPrismaService.chat.count.mockResolvedValue(mockTotalCount);

      const result = await service.getChats(userId);

      expect(result).toEqual({ data: mockChats, totalCount: mockTotalCount });
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
        take: 10,
        skip: 0,
        orderBy: {
          updatedAt: 'desc',
        },
      });
      expect(mockPrismaService.chat.count).toHaveBeenCalledWith({
        where: {
          OR: [{ buddyId: userId }, { customerId: userId }],
        },
      });
    });
  });

  describe('getHistory', () => {
    it('should return chat messages', async () => {
      const userId = 'user1';
      const chatId = 'chat1';
      const take = 10;
      const skip = 0;

      const mockChat = { id: chatId, buddyId: 'user2', customerId: userId };
      const mockMessages = [{ id: 'msg1', content: 'Hello' }];
      const mockTotalCount = 1;

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.findMany.mockResolvedValue(mockMessages);
      mockPrismaService.chatMessage.count.mockResolvedValue(mockTotalCount);

      const result = await service.getHistory(userId, chatId, take, skip);

      expect(result).toEqual({
        data: mockMessages,
        totalCount: mockTotalCount,
      });
      expect(mockPrismaService.chat.findUnique).toHaveBeenCalledWith({
        where: {
          id: chatId,
          OR: [{ buddyId: userId }, { customerId: userId }],
        },
      });
      expect(mockPrismaService.chatMessage.findMany).toHaveBeenCalledWith({
        where: { chatId },
        orderBy: { createdAt: 'desc' },
        omit: {
          chatId: true,
          updatedAt: true,
          deletedAt: true,
        },
        take,
        skip,
      });
      expect(mockPrismaService.chatMessage.count).toHaveBeenCalledWith({
        where: { chatId },
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
    it('should create a message when sender is customer', async () => {
      const chatId = 'chat1';
      const senderId = 'user1';
      const content = 'Hello';
      const meta = {
        id: 'meta1',
        timestamp: new Date(),
        type: 'text' as const,
        content: 'Hello',
      };

      const mockChat = { id: chatId, buddyId: 'buddy1', customerId: senderId };
      const mockMessage = { id: 'msg1', content, meta };
      const mockUser = { userId: senderId, buddy: { buddyId: null } };
      const mockTargetUser = { userId: 'target1' };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.create.mockResolvedValue(mockMessage);
      mockPrismaService.buddy.findUnique.mockResolvedValue({
        userId: 'target1',
      });

      const result = await service.createMessage(
        chatId,
        senderId,
        content,
        meta,
      );

      expect(result).toEqual({
        message: mockMessage,
        sendto: mockTargetUser.userId,
      });
      expect(mockPrismaService.chatMessage.create).toHaveBeenCalledWith({
        data: {
          chatId,
          senderId: mockUser.userId,
          content,
          meta,
          status: ChatMessageStatus.WAITING,
        },
      });
    });

    it('should create a message when sender is buddy', async () => {
      const chatId = 'chat1';
      const buddyId = 'buddy1';
      const content = 'Hello';
      const meta = {
        id: 'meta1',
        timestamp: new Date(),
        type: 'text' as const,
        content: 'Hello',
      };

      const mockChat = { id: chatId, buddyId, customerId: 'customer1' };
      const mockMessage = { id: 'msg1', content, meta };
      const mockUser = {
        userId: 'user1',
        buddy: { buddyId },
      };
      const mockTargetUser = { userId: 'customer1' };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.create.mockResolvedValue(mockMessage);
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);

      const result = await service.createMessage(
        chatId,
        buddyId,
        content,
        meta,
      );

      expect(result).toEqual({
        message: mockMessage,
        sendto: mockTargetUser.userId,
      });
      expect(mockPrismaService.chatMessage.create).toHaveBeenCalledWith({
        data: {
          chatId,
          senderId: mockUser.userId,
          content,
          meta,
          status: ChatMessageStatus.WAITING,
        },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      const mockUser = { userId: 'user1', buddy: null };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
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

    it('should throw NotFoundException if sender not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.createMessage('chat1', 'user1', 'Hello', {
          id: 'meta1',
          timestamp: new Date(),
          type: 'text',
          content: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target user not found', async () => {
      const mockChat = { id: 'chat1', buddyId: 'buddy1', customerId: 'user1' };
      const mockUser = { userId: 'user1', buddy: { buddyId: 'buddy1' } };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.chatMessage.create.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createMessage('chat1', 'buddy1', 'Hello', {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { readAt: expect.any(Date) },
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          readAt: expect.any(Date),
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
