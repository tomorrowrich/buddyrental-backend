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
import { NotificationsService } from '@app/notifications/notifications.service';

@Injectable()
export class ReservationService {
  constructor(
    private prisma: PrismaService,
    private scheduleService: ScheduleService,
    private readonly notificationService: NotificationsService,
  ) {}

  async getReservationHistory(buddyId: string, take = 10, skip = 0) {
    const data = await this.prisma.reservationRecord.findMany({
      where: { buddyId: buddyId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            email: true,
            phoneNumber: true,
            citizenId: true,
            address: true,
            interests: true,
          },
        },
      },
      take,
      skip,
      orderBy: [{ updatedAt: 'desc' }, { reservationStart: 'desc' }],
    });
    const totalCount = await this.prisma.reservationRecord
      .count({
        where: { buddyId },
      })
      .then((count) => Math.ceil(count / take));
    return {
      data,
      totalCount,
    };
  }

  async getBookingHistory(userId: string, take = 10, skip = 0) {
    const data = await this.prisma.reservationRecord.findMany({
      where: { userId },
      include: {
        buddy: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                email: true,
                phoneNumber: true,
                citizenId: true,
                address: true,
              },
            },
            tags: {
              select: {
                tagId: true,
                name: true,
              },
            },
          },
        },
      },
      take,
      skip,
      orderBy: [{ updatedAt: 'desc' }, { reservationStart: 'desc' }],
    });
    const totalCount = await this.prisma.reservationRecord
      .count({
        where: { userId },
      })
      .then((count) => Math.ceil(count / take));
    return {
      data,
      totalCount,
    };
  }

  async getReservationStatus(reservationId: string) {
    const reservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
      select: {
        status: true,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation.status;
  }

  async getReservationDetail(reservationId: string) {
    const reservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            email: true,
            phoneNumber: true,
            citizenId: true,
            address: true,
          },
        },
        buddy: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                email: true,
                phoneNumber: true,
                citizenId: true,
                address: true,
              },
            },
            tags: true,
          },
        },
      },
    });
    return reservation;
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

    if (userId === payload.buddyId) {
      throw new BadRequestException('You cannot reserve yourself');
    }

    const buddy = await this.prisma.buddy.findUnique({
      where: { buddyId: payload.buddyId },
      include: {
        user: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!buddy) {
      throw new NotFoundException('Buddy not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
      },
    });

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
            detail: payload.detail,
            status: 'PENDING',
            reservationStart: new Date(payload.reservationStart),
            reservationEnd: new Date(payload.reservationEnd),
            scheduleId: schedule.schedule.scheduleId,
          },
        });
        return { reservation, schedule };
      },
    );

    if (buddy.user) {
      await this.notificationService.createNotification(buddy.user.userId, {
        type: 'Booking',
        title: 'New Reservation Request',
        body: `You have a new reservation request from ${user!.firstName} ${user!.lastName}`,
      });
    }

    return {
      success: true,
      data: { reservation, schedule },
    };
  }

  async confirmReservation(userId: string, reservationId: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
      include: {
        buddy: {
          select: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
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

    if (existingReservation.user && existingReservation.buddy.user) {
      await this.notificationService.createNotification(
        existingReservation.user.userId,
        {
          type: 'Booking',
          title: 'Reservation Confirmed',
          body: `Your reservation with ${existingReservation.buddy.user.firstName} ${existingReservation.buddy.user.lastName} has been confirmed`,
          url: `/booking/history`,
        },
      );
    }

    return {
      success: true,
      data: { reservation, schedule },
    };
  }

  async rejectReservation(userId: string, reservationId: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
      include: {
        buddy: {
          select: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
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

      await this.scheduleService.updateSchedule(reservation.scheduleId, {
        status: 'AVAILABLE',
      });

      return { reservation };
    });

    if (existingReservation.user) {
      await this.notificationService.createNotification(
        existingReservation.user.userId,
        {
          type: 'Booking',
          title: 'Reservation Rejected',
          body: `Your reservation with ${existingReservation.buddyId} has been rejected`,
          url: `/booking/history`,
        },
      );
    }

    return {
      success: true,
      data: { reservation },
    };
  }

  async cancelReservation(userId: string, reservationId: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId },
      include: {
        buddy: {
          select: {
            userId: true,
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (
      existingReservation.status !== 'PENDING' &&
      existingReservation.status !== 'ACCEPTED'
    ) {
      throw new BadRequestException('Reservation is not pending or accepted');
    }

    if (
      existingReservation.buddy.userId !== userId &&
      existingReservation.userId !== userId
    ) {
      throw new ForbiddenException('You are not the in this reservation');
    }

    const { reservation } = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservationRecord.update({
        where: { reservationId },
        data: { status: 'CANCELLED' },
      });

      await this.scheduleService.updateSchedule(reservation.scheduleId, {
        status: 'AVAILABLE',
      });

      return { reservation };
    });

    if (
      existingReservation.buddy.userId &&
      userId === existingReservation.userId
    ) {
      await this.notificationService.createNotification(
        existingReservation.buddy.userId,
        {
          type: 'Booking',
          title: 'Reservation Cancelled',
          body: `Your reservation with ${existingReservation.user.firstName} ${existingReservation.user.lastName} has been cancelled`,
          url: `/booking/history/buddy`,
        },
      );
    }

    if (
      existingReservation.userId &&
      existingReservation.buddy.user &&
      userId === existingReservation.buddy.userId
    ) {
      await this.notificationService.createNotification(
        existingReservation.userId,
        {
          type: 'Booking',
          title: 'Reservation Cancelled',
          body: `Your reservation with ${existingReservation.buddy.user.firstName} ${existingReservation.buddy.user.lastName} has been cancelled`,
          url: `/booking/history`,
        },
      );
    }

    return {
      success: true,
      data: { reservation },
    };
  }

  async completeReservation(userId: string, id: string) {
    const existingReservation = await this.prisma.reservationRecord.findUnique({
      where: { reservationId: id },
      include: {
        buddy: {
          select: {
            userId: true,
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!existingReservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (existingReservation.status !== 'ACCEPTED') {
      throw new BadRequestException('Reservation is not accepted');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        buddy: {
          select: {
            buddyId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      existingReservation.buddyId !== user.buddy?.buddyId &&
      user.userId !== existingReservation.userId
    ) {
      throw new ForbiddenException(
        'You are not the participate in this reservation',
      );
    }

    const { reservation } = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservationRecord.update({
        where: { reservationId: id },
        data: { status: 'COMPLETED' },
      });

      await this.scheduleService.updateSchedule(reservation.scheduleId, {
        status: 'AVAILABLE',
      });

      return { reservation };
    });

    if (
      existingReservation.buddy.userId &&
      userId === existingReservation.user.userId
    ) {
      await this.notificationService.createNotification(
        existingReservation.buddy.userId,
        {
          type: 'Booking',
          title: 'Reservation Completed',
          body: `Your reservation with ${existingReservation.user.firstName} ${existingReservation.user.lastName} has been completed`,
          url: `/booking/history/buddy`,
        },
      );
    }

    if (
      existingReservation.user.userId &&
      existingReservation.buddy.user &&
      userId === existingReservation.buddy.userId
    ) {
      await this.notificationService.createNotification(
        existingReservation.user.userId,
        {
          type: 'Booking',
          title: 'Reservation Completed',
          body: `Your reservation with ${existingReservation.buddy.user.firstName} ${existingReservation.buddy.user.lastName} has been completed`,
          url: `/booking/history`,
        },
      );
    }

    return {
      success: true,
      data: { reservation },
    };
  }
}
