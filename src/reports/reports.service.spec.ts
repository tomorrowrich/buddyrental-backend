import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    buddy: {
      findUnique: jest.fn(),
    },
    reportsCategory: {
      findUnique: jest.fn(),
    },
    reports: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    it('should create a report successfully', async () => {
      const reporterId = 'user-123';
      const createReportDto: CreateReportDto = {
        userId: 'user-456',
        buddyId: 'buddy-123',
        categoryId: 'category-123',
        details: 'Report details',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        userId: reporterId,
      });
      mockPrismaService.buddy.findUnique.mockResolvedValueOnce({
        buddyId: createReportDto.buddyId,
      });
      mockPrismaService.reportsCategory.findUnique.mockResolvedValueOnce({
        id: createReportDto.categoryId,
      });
      mockPrismaService.reports.create.mockResolvedValueOnce({
        id: 'report-123',
        reporterId,
        ...createReportDto,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createReport(reporterId, createReportDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: reporterId },
      });
      expect(mockPrismaService.buddy.findUnique).toHaveBeenCalledWith({
        where: { buddyId: createReportDto.buddyId },
      });
      expect(mockPrismaService.reportsCategory.findUnique).toHaveBeenCalledWith(
        {
          where: { id: createReportDto.categoryId },
        },
      );
      expect(mockPrismaService.reports.create).toHaveBeenCalledWith({
        data: {
          reporterId,
          userId: createReportDto.userId,
          categoryId: createReportDto.categoryId,
          details: createReportDto.details,
          buddyId: createReportDto.buddyId,
          status: 'PENDING',
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const reporterId = 'user-123';
      const createReportDto: CreateReportDto = {
        userId: 'user-456',
        buddyId: 'buddy-123',
        categoryId: 'category-123',
        details: 'Report details',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createReport(reporterId, createReportDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReportHistory', () => {
    it('should return reports with pagination', async () => {
      const mockReports = [{ id: 'report-1' }, { id: 'report-2' }];
      mockPrismaService.reports.findMany.mockResolvedValueOnce(mockReports);
      mockPrismaService.reports.count.mockResolvedValueOnce(2);

      const result = await service.getReportHistory({
        take: 10,
        skip: 0,
        categoryId: 'category-123',
        status: 'PENDING',
      });

      expect(result).toEqual({
        data: mockReports,
        take: 10,
        skip: 0,
        totalCount: 2,
      });
      expect(mockPrismaService.reports.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: 'category-123',
          status: 'PENDING',
        },
        take: 10,
        skip: 0,
        orderBy: {
          updatedAt: 'desc',
        },
      });
    });
  });
});
