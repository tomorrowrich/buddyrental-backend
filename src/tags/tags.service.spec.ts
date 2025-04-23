import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TagsService', () => {
  let tagsService: TagsService;

  // Mocking PrismaService
  const prismaServiceMock = {
    tag: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    tagsService = module.get<TagsService>(TagsService);
  });

  describe('getAllTags', () => {
    it('should return a list of all tag names', async () => {
      // Mocking the return value of Prisma's findMany
      const mockTags = [{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }];

      prismaServiceMock.tag.findMany.mockResolvedValue(mockTags);

      const result = await tagsService.getAllTags();

      expect(result).toHaveProperty('tags');
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return an empty list if no tags are found', async () => {
      // Mocking an empty response
      prismaServiceMock.tag.findMany.mockResolvedValue([]);

      const result = await tagsService.getAllTags();

      expect(result).toHaveProperty('tags');
      expect(result.tags).toEqual([]);
    });
  });
});
