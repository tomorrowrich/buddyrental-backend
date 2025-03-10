import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { PaginatedOutputDto } from '@app/interfaces/paginated-output.dto';
import { Prisma, Tag } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class InterestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(amount: number = 5) {
    if (amount < 1) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (amount > 100) {
      throw new BadRequestException('Amount must be less than 100');
    }

    if (!Number.isInteger(amount)) {
      throw new BadRequestException('Amount must be an integer');
    }

    const suggestions = await this.prisma.$queryRaw<
      { tag_id: string; name: string }[]
    >`SELECT tag_id,name FROM "Tag" ORDER BY random() LIMIT ${amount};`.then(
      (res) => res.map((tag) => ({ id: tag.tag_id, name: tag.name })),
    );

    if (suggestions.length === 0) {
      throw new NotFoundException('No suggestions found');
    }

    return { suggestions };
  }

  async createInterest(name: string) {
    const existingInterest = await this.prisma.tag.findFirst({
      where: {
        name,
      },
    });

    if (existingInterest) {
      throw new BadRequestException('Interest already exists');
    }

    return this.prisma.tag.create({
      data: {
        name,
      },
    });
  }

  async getAllInterests(
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedOutputDto<Tag>> {
    const paginate = createPaginator({ perPage, page });

    // equivalent to paginating `this.prisma.tag.findMany();`
    const tags = await paginate<Tag, Prisma.TagFindManyArgs>(this.prisma);
    return tags;
  }

  async getMyInterests(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        userId,
      },
      include: {
        interests: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { interests: user.interests };
  }

  async searchRelatedInterests(query: string) {
    return {
      tags: await this.prisma.tag.findMany({
        where: {
          name: {
            mode: 'insensitive',
            contains: query,
          },
        },
        orderBy: {
          _relevance: {
            fields: ['name'],
            search: 'database',
            sort: 'asc',
          },
        },
        take: 10,
      }),
    };
  }
}
