import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async getBookingHistory(customerId: string) {
    return this.prisma.reservationRecord.findMany({
      where: { userId: customerId },
      include: {
        buddy: {
          select: { buddyId: true },
        },
      },
      orderBy: { reservationDate: 'desc' },
    });
  }
}
