import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BuddyService {
  constructor(private prisma: PrismaService) {}

  async updatePricing(buddyId: string, minPrice: number, maxPrice: number) {
    const buddy = await this.prisma.buddy.findUnique({ where: { buddyId } });
    if (!buddy) {
      throw new NotFoundException(`Buddy with ID ${buddyId} not found`);
    }

    return this.prisma.buddy.update({
      where: { buddyId },
      data: { minPrice, maxPrice },
    });
  }
}
