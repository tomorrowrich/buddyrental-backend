import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { TransactionType, TrasactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async transferToBuddy(userId: string, buddyId: string, amount: number) {
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
        data: { balance: { increment: amount } },
      });

      return await tx.transaction.create({
        data: {
          userId,
          buddyId,
          amount,
          type: TransactionType.TRANSFER,
          status: TrasactionStatus.COMPLETED,
          meta: {},
        },
      });
    });
  }

  async getTransactionsByUser(userId: string) {
    return await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTransactionsForBuddy(buddyId: string) {
    return await this.prisma.transaction.findMany({
      where: { buddyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
