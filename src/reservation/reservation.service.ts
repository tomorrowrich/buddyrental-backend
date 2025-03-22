import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from '@app/schedule/schedule.service';
import { CreateReservationDto } from './dtos/create-reservation.dto';
import { ScheduleStatus } from '@prisma/client';

@Injectable()
export class ReservationService {
  constructor(
    private prisma: PrismaService,
    private scheduleService: ScheduleService,
  ) {}

  async getReservationHistory(buddyId: string) {
    return this.prisma.reservationRecord.findMany({
      where: { buddyId: buddyId },
      include: {
        user: true,
      },
      orderBy: { reservationStart: 'desc' },
    });
  }

  async getBookingHistory(userId: string) {
    return this.prisma.reservationRecord.findMany({
      where: { userId },
      include: {
        buddy: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { reservationStart: 'desc' },
    });
  }

  async createReservation(userId: string, payload: CreateReservationDto) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (new Date(payload.reservationStart) < new Date()) {
      throw new BadRequestException(
        'Reservation start date must be in the future',
      );
    }

    if (
      new Date(payload.reservationEnd) <= new Date(payload.reservationStart)
    ) {
      throw new BadRequestException(
        'Reservation end date must be after start date',
      );
    }

    const buddy = await this.prisma.buddy.findUnique({
      where: { buddyId: payload.buddyId },
    });
    if (!buddy) {
      throw new NotFoundException('Buddy not found');
    }

    const { reservation, schedule } = await this.prisma.$transaction(
      async (tx) => {
        const schedule = await this.scheduleService.createSchedule(
          buddy.buddyId,
          new Date(payload.reservationStart),
          new Date(payload.reservationEnd),
          ScheduleStatus.UNCONFIRMED,
          `Reservation with their budder`,
        );
        const reservation = await tx.reservationRecord.create({
          data: {
            userId,
            buddyId: payload.buddyId,
            price: payload.price,
            status: 'PENDING',
            reservationStart: new Date(payload.reservationStart),
            reservationEnd: new Date(payload.reservationEnd),
            scheduleId: schedule.scheduleId,
          },
        });
        return { reservation, schedule };
      },
    );

    return {
      success: true,
      data: { reservation, schedule },
    };
  }

  async confirmReservation(userId: string, reservationId: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
    });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (existingReservation.status !== 'PENDING') {
      throw new BadRequestException('Reservation is not pending');
    }

    if (existingReservation.buddyId !== userId) {
      throw new ForbiddenException('You are not the owner of this reservation');
    }

    const { reservation, schedule } = await this.prisma.$transaction(
      async (tx) => {
        const reservation = await tx.reservationRecord.update({
          where: { reservationId },
          data: { status: 'ACCEPTED' },
        });
        const schedule = await this.scheduleService.updateSchedule(
          reservation.scheduleId,
          {
            status: ScheduleStatus.BUSY,
          },
        );

        return { reservation, schedule };
      },
    );

    return {
      success: true,
      data: { reservation, schedule },
    };
  }

  async rejectReservation(userId: string, reservationId: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
    });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (existingReservation.status !== 'PENDING') {
      throw new BadRequestException('Reservation is not pending');
    }

    if (existingReservation.buddyId !== userId) {
      throw new ForbiddenException('You are not the owner of this reservation');
    }

    const { reservation } = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservationRecord.update({
        where: { reservationId },
        data: { status: 'REJECTED' },
      });

      await this.scheduleService.deleteSchedule(reservation.scheduleId);

      return { reservation };
    });

    return {
      success: true,
      data: { reservation },
    };
  }

  async cancelReservation(userId: string, reservationId: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
    });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (existingReservation.status !== 'PENDING') {
      throw new BadRequestException('Reservation is not pending');
    }

    if (
      existingReservation.buddyId !== userId &&
      existingReservation.userId !== userId
    ) {
      throw new ForbiddenException('You are not the in this reservation');
    }

    const { reservation } = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservationRecord.update({
        where: { reservationId },
        data: { status: 'CANCELLED' },
      });

      await this.scheduleService.deleteSchedule(reservation.scheduleId);

      return { reservation };
    });

    return {
      success: true,
      data: { reservation },
    };
  }

  async completeReservation(userId: string, id: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId: id },
    });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (existingReservation.status !== 'PENDING') {
      throw new BadRequestException('Reservation is not pending');
    }

    if (existingReservation.buddyId !== userId) {
      throw new ForbiddenException('You are not the owner of this reservation');
    }

    const { reservation } = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservationRecord.update({
        where: { reservationId: id },
        data: { status: 'COMPLETED' },
      });

      await this.scheduleService.deleteSchedule(reservation.scheduleId);

      return { reservation };
    });

    return {
      success: true,
      data: { reservation },
    };
  }
}
