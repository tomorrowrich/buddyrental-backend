import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuddyDto } from './dto/create-buddy.dto';
import { PaymentService } from '@app/payment/payment.service';

@Injectable()
export class BuddyService {
  constructor(
    private prisma: PrismaService,
    private payment: PaymentService,
  ) {}

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
      include: { tags: true, user: true, reviews: true },
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

  async createBuddy(userId: string, data: CreateBuddyDto) {
    const existingBuddy = await this.prisma.buddy.findUnique({
      where: { userId },
    });
    if (existingBuddy) {
      throw new BadRequestException('Buddy already exists for this user');
    }
    const onboard = await this.payment.onboardBuddy(userId);

    const buddy = await this.prisma.buddy.create({
      data: {
        userId,
        priceMin: data.minPrice,
        priceMax: data.maxPrice,
        description: data.description,
        balanceWithdrawable: 0,
        stripeAccountId: onboard.stripeAccountId,
      },
    });

    return { buddy, onboard };
  }
}
