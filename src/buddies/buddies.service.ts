import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BuddiesService {
  constructor(private prisma: PrismaService) {}

  async getBuddies(page = 1, limit = 10, sort = 'newest') {
    page = Math.max(1, page);
    limit = Math.max(1, limit);
    const skip = (page - 1) * limit;

    const orderBy: Prisma.BuddyOrderByWithRelationInput =
      sort === 'ratingAvg' ? { ratingAvg: 'desc' } : { createdAt: 'desc' };

    const buddies = await this.prisma.buddy.findMany({
      skip,
      take: limit,
      orderBy,
      include: { tags: true, user: true, reviews: true },
    });

    const totalBuddies = await this.prisma.buddy.count();

    return {
      buddies,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalBuddies / limit),
      },
    };
  }

  async searchBuddies(
    query?: string,
    tags?: string[],
    minRating?: number,
    sort?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // กำหนดชนิดข้อมูลของ where
    const where: Prisma.BuddyWhereInput = {};

    if (query) {
      where.OR = [
        { user: { displayName: { contains: query, mode: 'insensitive' } } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          name: { in: tags },
        },
      };
    }

    if (minRating !== undefined) {
      where.ratingAvg = { gte: minRating };
    }

    // นับจำนวนทั้งหมด
    const totalBuddies = await this.prisma.buddy.count({ where });

    // คำนวณจำนวนหน้า
    const totalPages = Math.ceil(totalBuddies / limit);

    // ค้นหาข้อมูล
    const buddies = await this.prisma.buddy.findMany({
      where,
      include: {
        user: {
          select: { displayName: true, email: true, profilePicture: true },
        },
        tags: true,
      },
      orderBy: sort
        ? { ratingAvg: sort === 'asc' ? 'asc' : 'desc' }
        : undefined,
      skip: (page - 1) * limit,
      take: limit,
    });

    // จัดรูปแบบ response
    return {
      results: buddies.map((buddy) => ({
        id: buddy.userId,
        name: buddy.user ? buddy.user.displayName : 'Unknown',
        email: buddy.user ? buddy.user.email : 'No Email',
        rating: buddy.ratingAvg,
        tags: buddy.tags,
        description: buddy.description,
        profile_picture:
          buddy.user?.profilePicture ?? 'https://example.com/default.jpg',
      })),
      pagination: {
        current_page: page,
        total_pages: totalPages,
      },
    };
  }
}
