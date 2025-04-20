import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async transferToBuddy(
    userId: string,
    buddyId: string,
    amount: number,
    reservationId: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be more than 0');
    }

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { userId } });

      if (!user || user.balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const buddy = await tx.buddy.findUnique({
        where: { buddyId },
        include: { user: true },
      });

      if (!buddy || !buddy.userId) {
        throw new NotFoundException('Buddy or buddy.userId not found');
      }

      await tx.user.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      await tx.user.update({
        where: { userId: buddy.userId },
        data: { balance: { increment: amount * 0.85 } },
      });

      const updatedReservation = await tx.reservationRecord.update({
        where: { reservationId },
        data: { price: amount },
      });

      return updatedReservation;
    });
  }
}
