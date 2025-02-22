import { Test, TestingModule } from '@nestjs/testing';
import { InterestsService } from './interests.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InterestsService', () => {
  let service: InterestsService;
  let tags: { name: string }[];
  const mockPrismaService = {
    $queryRaw: jest.fn(),
    tag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    tags = [{ name: 'Test1' }, { name: 'Test2' }, { name: 'Test3' }];

    // Reset mocks for each test.
    mockPrismaService.$queryRaw.mockReset();
    mockPrismaService.tag.findMany.mockReset();
    mockPrismaService.tag.findFirst.mockReset();
    mockPrismaService.tag.create.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InterestsService>(InterestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllInterests', () => {
    it('should return all interests', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue(tags);
      const results = await service.getAllInterests();
      expect(results).toEqual(tags);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalled();
    });
  });

  describe('getSuggestions', () => {
    it('should return valid suggestions when data exists', async () => {
      const rawTags = [
        { tag_id: '1', name: 'Test1' },
        { tag_id: '2', name: 'Test2' },
      ];
      mockPrismaService.$queryRaw.mockResolvedValue(rawTags);
      const result = await service.getSuggestions(2);
      expect(result).toEqual({
        suggestions: [
          { id: '1', name: 'Test1' },
          { id: '2', name: 'Test2' },
        ],
      });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no suggestions are found', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]); // simulate empty result
      await expect(service.getSuggestions(5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when amount is less than 1', async () => {
      await expect(service.getSuggestions(0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when amount is greater than 100', async () => {
      await expect(service.getSuggestions(101)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when amount is not an integer', async () => {
      await expect(service.getSuggestions(5.5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createInterest', () => {
    it('should create a new interest when it does not exist', async () => {
      // Simulate interest not existing
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      const newInterest = { name: 'NewInterest' };
      mockPrismaService.tag.create.mockResolvedValue(newInterest);
      const result = await service.createInterest('NewInterest');
      expect(result).toEqual(newInterest);
      expect(mockPrismaService.tag.findFirst).toHaveBeenCalledWith({
        where: { name: 'NewInterest' },
      });
      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: { name: 'NewInterest' },
      });
    });

    it('should throw BadRequestException when interest already exists', async () => {
      // Simulate interest exists
      mockPrismaService.tag.findFirst.mockResolvedValue({ name: 'Test' });
      await expect(service.createInterest('Test')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('searchRelatedInterests', () => {
    it('should return related interests matching a query', async () => {
      const searchResult = [{ name: 'Test1' }];
      // simulate search result from prisma
      mockPrismaService.tag.findMany.mockResolvedValue(searchResult);
      const result = await service.searchRelatedInterests('Test');
      expect(result).toEqual({ tags: searchResult });
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'Test' } },
        orderBy: {
          _relevance: {
            fields: ['name'],
            search: 'database',
            sort: 'asc',
          },
        },
        take: 10,
      });
    });

    it('should return an empty array if no related interests are found', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue([]);
      const result = await service.searchRelatedInterests('Nonexistent');
      expect(result).toEqual({ tags: [] });
    });
  });
});
