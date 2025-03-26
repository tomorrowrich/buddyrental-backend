import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { Reports } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(
    reporterId: string,
    data: CreateReportDto,
  ): Promise<Reports> {
    const user = await this.prisma.user.findUnique({
      where: { userId: reporterId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const buddy = await this.prisma.buddy.findUnique({
      where: { buddyId: data.buddyId },
    });
    if (!buddy) {
      throw new NotFoundException('Buddy not found');
    }

    const category = await this.prisma.reportsCategory.findUnique({
      where: {
        id: data.categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const report = await this.prisma.reports.create({
      data: {
        reporterId: user.userId,
        userId: data.userId,
        categoryId: data.categoryId,
        details: data.details,
        buddyId: data.buddyId,
        status: 'PENDING',
      },
    });

    return report;
  }

  async getReportHistory({
    take = 10,
    skip = 0,
    categoryId,
    status,
  }: {
    take?: number;
    skip?: number;
    categoryId?: string;
    status?: 'PENDING' | 'RESOLVED';
  } = {}) {
    const reports = this.prisma.reports.findMany({
      where: {
        categoryId,
        status,
      },
      take,
      skip,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const totalCount = this.prisma.reports.count({
      where: {
        categoryId,
        status,
      },
    });

    return {
      data: await reports,
      take,
      skip,
      totalCount: await totalCount,
    };
  }
}
