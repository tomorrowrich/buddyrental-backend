import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MakeBuddyDto } from './dto/make-buddy.dto';

@Injectable()
export class BuddyService {
  constructor(private prisma: PrismaService) {}

  async makeBuddy(userId: string, makeBuddyDto: MakeBuddyDto) {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
      include: { buddy: true },
    });
    if (!user) {
      throw new NotFoundException(`User with this ID not found`);
    }
    if (user.buddy) {
      throw new ForbiddenException(`User is already a buddy`);
    }

    return this.prisma.buddy.create({
      data: {
        balanceWithdrawable: 0,
        priceMin: makeBuddyDto.minPrice,
        priceMax: makeBuddyDto.maxPrice,
        userId: userId,
      },
    });
  }

  async updatePricing(buddyId: string, priceMin: number, priceMax: number) {
    const buddy = await this.prisma.buddy.findUnique({ where: { buddyId } });
    if (!buddy) {
      throw new NotFoundException(`Buddy with ID ${buddyId} not found`);
    }

    return this.prisma.buddy.update({
      where: { buddyId },
      data: { priceMin, priceMax },
    });
  }

  async getBuddyProfile(buddyId: string) {
    return this.prisma.buddy.findUnique({
      where: { buddyId },
      include: { tags: true },
    });
  }

  async updateOfferedServices(buddyId: string, tagsIds: string[]) {
    const tags = await this.prisma.tag.findMany({
      where: { tagId: { in: tagsIds } },
    });
    const buddy = await this.prisma.buddy.findUnique({ where: { buddyId } });
    if (!buddy) {
      throw new NotFoundException(`Buddy with ID ${buddyId} not found`);
    }

    return {
      success: true,
      message: 'Offered services updated successfully',
      services: await this.prisma.buddy
        .update({
          where: { buddyId },
          data: { tags: { set: tags } },
          include: { tags: true },
        })
        .then((buddy) => buddy.tags),
    };
  }
}
