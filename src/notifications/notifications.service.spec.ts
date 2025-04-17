import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { Observable } from 'rxjs';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    notifications: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create new stream for new user and increment connection count', () => {
      const userId = 'user-123';
      const result = service.subscribe(userId);

      expect(result).toBeInstanceOf(Observable);
    });

    it('should reuse existing stream and increment connection count for existing user', () => {
      const userId = 'user-123';

      // Subscribe twice
      service.subscribe(userId);
      service.subscribe(userId);

      // No direct way to test the internal maps, but we're testing it works
      // by verifying it doesn't throw an error
      expect(() => service.subscribe(userId)).not.toThrow();
    });
  });

  describe('readNotification', () => {
    it('should update notification as read', async () => {
      const userId = 'user-123';
      const notificationId = 'notif-123';
      mockPrismaService.notifications.update.mockResolvedValue({
        id: notificationId,
        read: true,
      });

      const result = await service.readNotification(userId, notificationId);

      expect(mockPrismaService.notifications.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { read: true },
      });
      expect(result).toEqual({
        success: true,
        message: 'Notification marked as read.',
      });
    });
  });

  describe('createNotification', () => {
    it('should create notification and send to user', async () => {
      const userId = 'user-123';
      const payload = {
        title: 'Test Title',
        body: 'Test Body',
        type: NotificationType.Booking,
        url: 'http://example.com',
      };

      const mockUser = { userId, email: 'test@example.com' };
      const mockNotification = { id: 'notif-123', ...payload, userId };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.notifications.create.mockResolvedValue(
        mockNotification,
      );

      await service.createNotification(userId, payload);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.notifications.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          url: payload.url,
        },
      });
    });

    it('should throw error if userId is not provided', async () => {
      const payload = {
        title: 'Test Title',
        body: 'Test Body',
        type: NotificationType.Booking,
      };

      await expect(service.createNotification('', payload)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('should throw error if user is not found', async () => {
      const userId = 'nonexistent-user';
      const payload = {
        title: 'Test Title',
        body: 'Test Body',
        type: NotificationType.Booking,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createNotification(userId, payload)).rejects.toThrow(
        'User not found, notification not sent',
      );
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications', async () => {
      const userId = 'user-123';
      const mockNotifications = [{ id: 'notif-1' }, { id: 'notif-2' }];

      mockPrismaService.notifications.findMany.mockResolvedValue(
        mockNotifications,
      );

      const result = await service.getUnreadNotifications(userId);

      expect(mockPrismaService.notifications.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-123';

      await service.markAllAsRead(userId);

      expect(mockPrismaService.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    });
  });

  describe('getNotifications', () => {
    it('should return notifications with pagination info', async () => {
      const userId = 'user-123';
      const mockNotifications = [{ id: 'notif-1' }, { id: 'notif-2' }];
      const totalCount = 2;

      mockPrismaService.notifications.findMany.mockResolvedValue(
        mockNotifications,
      );
      mockPrismaService.notifications.count.mockResolvedValue(totalCount);

      const result = await service.getNotifications(userId);

      expect(mockPrismaService.notifications.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        skip: 0,
      });
      expect(mockPrismaService.notifications.count).toHaveBeenCalledWith({
        where: {
          userId,
          read: false,
        },
      });
      expect(result).toEqual({
        data: mockNotifications,
        take: 10,
        skip: 0,
        totalCount,
      });
    });
  });

  describe('onModuleDestroy', () => {
    it('should complete all streams and clear maps', () => {
      // First subscribe to create some streams
      service.subscribe('user-1');
      service.subscribe('user-2');

      // The method completes streams and clears maps
      service.onModuleDestroy();

      // No direct way to test internal state, so we're just ensuring it doesn't throw
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});
