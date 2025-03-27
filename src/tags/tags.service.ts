import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getAllTags() {
    const tags = await this.prisma.tag.findMany({ select: { name: true } });
    return { tags: tags.map((tag) => tag.name) };
  }
}
