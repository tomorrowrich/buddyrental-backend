import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BuddyService } from './buddy.service';
import { PrismaService } from '@app/prisma/prisma.service';

describe('BuddyService', () => {
  let service: BuddyService;
  const mockPrismaService = {
    buddy: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuddyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BuddyService>(BuddyService);
  });

  describe('updatePricing', () => {
    it('should throw NotFoundException if buddy is not found', async () => {
      mockPrismaService.buddy.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePricing('nonexistent', 10, 20),
      ).rejects.toThrow(
        new NotFoundException('Buddy with ID nonexistent not found'),
      );
    });

    it('should update pricing for an existing buddy', async () => {
      const foundBuddy = { buddyId: 'buddy1', priceMin: 0, priceMax: 0 };
      const updatedBuddy = { buddyId: 'buddy1', priceMin: 10, priceMax: 20 };
      mockPrismaService.buddy.findUnique.mockResolvedValue(foundBuddy);
      mockPrismaService.buddy.update.mockResolvedValue(updatedBuddy);

      const result = await service.updatePricing('buddy1', 10, 20);
      expect(result).toEqual(updatedBuddy);
      expect(mockPrismaService.buddy.update).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
        data: { priceMin: 10, priceMax: 20 },
      });
    });
  });

  describe('updateOfferedServices', () => {
    it('should throw NotFoundException if buddy is not found', async () => {
      const tagsArray = [{ tagId: 'tag1' }];
      mockPrismaService.tag.findMany.mockResolvedValue(tagsArray);
      mockPrismaService.buddy.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOfferedServices('nonexistent', ['tag1']),
      ).rejects.toThrow(
        new NotFoundException('Buddy with ID nonexistent not found'),
      );
    });

    it('should update offered services for an existing buddy', async () => {
      const tagsArray = [{ tagId: 'tag1' }, { tagId: 'tag2' }];
      mockPrismaService.tag.findMany.mockResolvedValue(tagsArray);
      mockPrismaService.buddy.findUnique.mockResolvedValue({
        buddyId: 'buddy1',
      });
      mockPrismaService.buddy.update.mockResolvedValue({
        tags: tagsArray,
      });

      const result = await service.updateOfferedServices('buddy1', [
        'tag1',
        'tag2',
      ]);
      expect(result).toEqual({
        success: true,
        message: 'Offered services updated successfully',
        services: tagsArray,
      });
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: { tagId: { in: ['tag1', 'tag2'] } },
      });
      expect(mockPrismaService.buddy.update).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
        data: { tags: { set: tagsArray } },
        include: { tags: true },
      });
    });
  });
});
