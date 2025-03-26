import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';

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
      findMany: jest.fn(),
      count: jest.fn(),
    },
    reports: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReportCategories', () => {
    it('should return categories with pagination', async () => {
      const mockCategories = [{ id: 'cat-1' }, { id: 'cat-2' }];
      mockPrismaService.reportsCategory.findMany.mockResolvedValueOnce(
        mockCategories,
      );
      mockPrismaService.reportsCategory.count.mockResolvedValueOnce(2);

      const result = await service.getReportCategories(10, 0);

      expect(result).toEqual({
        data: mockCategories,
        take: 10,
        skip: 0,
        totalCount: 2,
      });
      expect(mockPrismaService.reportsCategory.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
      expect(mockPrismaService.reportsCategory.count).toHaveBeenCalled();
    });
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

    it('should throw NotFoundException if buddy not found', async () => {
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
      mockPrismaService.buddy.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.createReport(reporterId, createReportDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category not found', async () => {
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
      mockPrismaService.reportsCategory.findUnique.mockResolvedValueOnce(null);

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
      expect(mockPrismaService.reports.count).toHaveBeenCalledWith({
        where: {
          categoryId: 'category-123',
          status: 'PENDING',
        },
      });
    });

    it('should return reports with default pagination when no parameters provided', async () => {
      const mockReports = [{ id: 'report-1' }, { id: 'report-2' }];
      mockPrismaService.reports.findMany.mockResolvedValueOnce(mockReports);
      mockPrismaService.reports.count.mockResolvedValueOnce(2);

      const result = await service.getReportHistory();

      expect(result).toEqual({
        data: mockReports,
        take: 10,
        skip: 0,
        totalCount: 2,
      });
      expect(mockPrismaService.reports.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: undefined,
          status: undefined,
        },
        take: 10,
        skip: 0,
        orderBy: {
          updatedAt: 'desc',
        },
      });
    });
  });

  describe('validateReportStatus', () => {
    it('should return undefined if status is not provided', () => {
      const result = service.validateReportStatus();
      expect(result).toBeUndefined();
    });

    it('should return the status if it is valid', () => {
      const result = service.validateReportStatus('PENDING');
      expect(result).toBe('PENDING');
    });

    it('should throw BadRequestException if status is invalid', () => {
      expect(() => service.validateReportStatus('INVALID')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateReportStatus', () => {
    it('should update report status successfully', async () => {
      const reportId = 'report-123';
      const status = 'RESOLVED' as ReportStatus;
      const mockReport = {
        id: reportId,
        status: 'PENDING',
      };
      const updatedReport = {
        ...mockReport,
        status,
      };

      mockPrismaService.reports.findUnique.mockResolvedValueOnce(mockReport);
      mockPrismaService.reports.update.mockResolvedValueOnce(updatedReport);

      const result = await service.updateReportStatus(reportId, status);

      expect(result).toBe(updatedReport);
      expect(mockPrismaService.reports.findUnique).toHaveBeenCalledWith({
        where: { id: reportId },
      });
      expect(mockPrismaService.reports.update).toHaveBeenCalledWith({
        where: { id: reportId },
        data: {
          status,
        },
      });
    });

    it('should throw NotFoundException if report not found', async () => {
      const reportId = 'report-123';
      const status = 'RESOLVED' as ReportStatus;

      mockPrismaService.reports.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateReportStatus(reportId, status),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
