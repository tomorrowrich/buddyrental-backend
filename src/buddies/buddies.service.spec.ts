import { Test, TestingModule } from '@nestjs/testing';
import { BuddiesService } from './buddies.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BuddiesService', () => {
  let buddiesService: BuddiesService;

  // Mocking PrismaService
  const prismaServiceMock = {
    buddy: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuddiesService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    buddiesService = module.get<BuddiesService>(BuddiesService);
  });

  describe('getBuddies', () => {
    it('should return a paginated list of buddies', async () => {
      // Mocking the return value of Prisma's findMany and count
      const mockBuddies = [
        {
          userId: '1',
          ratingAvg: 4.5,
          description: 'A friendly buddy',
          tags: [],
          createdAt: new Date(),
        },
        {
          userId: '2',
          ratingAvg: 4.0,
          description: 'Another great buddy',
          tags: [],
          createdAt: new Date(),
        },
      ];

      prismaServiceMock.buddy.findMany.mockResolvedValue(mockBuddies);
      prismaServiceMock.buddy.count.mockResolvedValue(mockBuddies.length);

      const result = await buddiesService.getBuddies(1, 10, 'newest');

      expect(result).toHaveProperty('buddies');
      expect(result.buddies).toEqual(mockBuddies);
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.current_page).toBe(1);
      expect(result.pagination.total_pages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      const mockBuddies = [
        { userId: '1', ratingAvg: 4.5, createdAt: new Date() },
        { userId: '2', ratingAvg: 4.0, createdAt: new Date() },
      ];

      prismaServiceMock.buddy.findMany.mockResolvedValue(mockBuddies);
      prismaServiceMock.buddy.count.mockResolvedValue(mockBuddies.length);

      const result = await buddiesService.getBuddies(2, 1, 'newest');

      expect(result.pagination.current_page).toBe(2);
      expect(result.pagination.total_pages).toBe(2);
    });
  });

  describe('searchBuddies', () => {
    it('should return a filtered list of buddies based on query', async () => {
      const mockBuddies = [
        {
          userId: '1',
          ratingAvg: 4.5,
          description: 'A friendly buddy',
          tags: [{ name: 'fitness' }],
          user: { displayName: 'Buddy One', email: 'buddy1@example.com' },
        },
      ];

      prismaServiceMock.buddy.findMany.mockResolvedValue(mockBuddies);
      prismaServiceMock.buddy.count.mockResolvedValue(mockBuddies.length);

      const result = await buddiesService.searchBuddies(
        'buddy',
        ['fitness'],
        4,
        'desc',
        1,
        10,
      );

      expect(result.results).toEqual([
        {
          id: '1',
          name: 'Buddy One',
          email: 'buddy1@example.com',
          rating: 4.5,
          tags: [{ name: 'fitness' }],
          description: 'A friendly buddy',
          profile_picture: 'https://example.com/default.jpg',
        },
      ]);
      expect(result.pagination.current_page).toBe(1);
      expect(result.pagination.total_pages).toBe(1);
    });

    it('should return an empty list when no buddies match the query', async () => {
      prismaServiceMock.buddy.findMany.mockResolvedValue([]);
      prismaServiceMock.buddy.count.mockResolvedValue(0);

      const result = await buddiesService.searchBuddies(
        'nonexistent',
        [],
        4,
        'desc',
        1,
        10,
      );

      expect(result.results).toEqual([]);
      expect(result.pagination.total_pages).toBe(0);
    });
  });
});
