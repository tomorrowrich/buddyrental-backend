import { PrismaService } from '@app/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Prisma,
  ReservationRecord,
  Schedule,
  ScheduleStatus,
} from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async getServices(query: ScheduleQueryDto, userId: string) {
    //prepare query
    if (!query.role) {
      query.role = 'customer';
    }
    if (!query.page) {
      query.page = 1;
    }
    if (!query.limit) {
      query.limit = 10;
    }

    //prepare options of prismaService findMany based on query

    const prismaOptions = {
      where: {},
    };

    if (query.role == 'customer') {
      prismaOptions.where['userId'] = userId;
    } else if (query.role == 'buddy') {
      prismaOptions.where['buddyId'] = userId;
    } else {
      throw new BadRequestException("Invalid role. Use 'customer' or 'buddy'.");
    }

    if (query.status) {
      prismaOptions.where['status'] = query.status;
    }

    if (query.startDate) {
      prismaOptions.where['reservationStart'] = {
        gte: new Date(query.startDate),
      };
    }

    if (query.endDate) {
      prismaOptions.where['reservationEnd'] = { lte: new Date(query.endDate) };
    }

    //initialize paginator
    const paginate = createPaginator({
      perPage: query.limit,
      page: query.page,
    });

    const result = await paginate<
      ReservationRecord,
      Prisma.ReservationRecordFindManyArgs
    >(this.prisma, {
      where: prismaOptions.where,
      include: {},
      orderBy: {
        reservationStart: 'asc',
      },
    });

    //write return message

    const returnMessage = {
      output: result,
    };
    if (result.data.length === 0) {
      returnMessage['message'] = 'No reservations found.';
    }
    return returnMessage;
  }

  async createSchedule(
    buddyId: string,
    startDate: Date,
    endDate: Date,
    status: ScheduleStatus,
    description: string,
  ) {
    // First check for BUSY schedules - these block all new reservations
    const busySchedule = await this.prisma.schedule.findFirst({
      where: {
        buddyId,
        status: ScheduleStatus.BUSY,
        OR: [
          {
            start: { lte: endDate },
            end: { gte: startDate },
          },
          {
            start: { gte: startDate },
            end: { lte: endDate },
          },
        ],
      },
    });

    if (busySchedule) {
      throw new BadRequestException(
        'Schedule conflicts with a BUSY schedule, no reservations allowed',
      );
    }

    // Check for unconfirmed reservations
    const conflictingReservation =
      await this.prisma.reservationRecord.findFirst({
        where: {
          buddyId,
          status: { not: 'CANCELLED' }, // Only consider non-cancelled reservations as conflicts
          reservationStart: { lte: endDate },
          reservationEnd: { gte: startDate },
        },
      });

    // If there's a conflicting reservation but it's unconfirmed, we still allow creating the schedule
    // but we might want to warn the user
    let warningMessage: string | null = null;
    if (conflictingReservation) {
      warningMessage =
        'There are reservations that may conflict with this schedule';
    }

    // Create the schedule
    const schedule = await this.prisma.schedule.create({
      data: {
        buddyId,
        start: startDate,
        end: endDate,
        status: status,
        description: description,
      },
    });

    return {
      schedule,
      warning: warningMessage,
    };
  }

  async updateSchedule(
    scheduleId: string,
    data: {
      status?: ScheduleStatus;
      start?: Date;
      end?: Date;
      description?: string;
    },
  ) {
    // Get the current schedule to find its buddyId
    const currentSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
    });

    if (!currentSchedule) {
      throw new BadRequestException('Schedule not found');
    }

    // Execute everything in a transaction
    return await this.prisma.$transaction(async (prisma) => {
      // Delegate to appropriate function based on status
      if (data.status === ScheduleStatus.BUSY) {
        return this.updateToBusy(prisma, scheduleId, currentSchedule, data);
      } else {
        return this.updateToAvailable(
          prisma,
          scheduleId,
          currentSchedule,
          data,
        );
      }
    });
  }

  private async updateToBusy(
    prisma: Prisma.TransactionClient,
    scheduleId: string,
    _currentSchedule: Schedule,
    data: {
      status?: ScheduleStatus;
      start?: Date;
      end?: Date;
      description?: string;
    },
  ) {
    // For BUSY status, we just update the schedule and check for conflicts
    // Check for conflicts with existing schedules
    const conflictingSchedules = await prisma.schedule.findMany({
      where: {
        buddyId: _currentSchedule.buddyId,
        scheduleId: { not: scheduleId },
        status: ScheduleStatus.BUSY,
        OR: [
          {
            start: { lte: data.end || _currentSchedule.end },
            end: { gte: data.start || _currentSchedule.start },
          },
          {
            start: { gte: data.start || _currentSchedule.start },
            end: { lte: data.end || _currentSchedule.end },
          },
        ],
      },
    });
    // If there are conflicts, throw an error
    if (conflictingSchedules.length > 0) {
      throw new BadRequestException(
        'Schedule conflicts with another schedules',
      );
    }

    // If no conflicts, update as requested
    await prisma.schedule.update({
      where: { scheduleId },
      data: {
        start: data.start,
        end: data.end,
        status: ScheduleStatus.BUSY,
        description: data.description,
      },
    });
    // Update others to AVAILABLE
    await prisma.schedule.updateManyAndReturn({
      where: {
        scheduleId: { not: scheduleId },
        buddyId: _currentSchedule.buddyId,
        status: ScheduleStatus.UNCONFIRMED,
        OR: [
          {
            start: { lte: data.end || _currentSchedule.end },
            end: { gte: data.start || _currentSchedule.start },
          },
          {
            start: { gte: data.start || _currentSchedule.start },
            end: { lte: data.end || _currentSchedule.end },
          },
        ],
      },
      data: {
        status: ScheduleStatus.AVAILABLE,
      },
    });
  }

  private async updateToAvailable(
    prisma: Prisma.TransactionClient,
    scheduleId: string,
    currentSchedule: Schedule,
    data: {
      status?: ScheduleStatus;
      start?: Date;
      end?: Date;
      description?: string;
    },
  ) {
    // If no conflicts, update as requested
    return await prisma.schedule.update({
      where: { scheduleId },
      data: {
        start: data.start,
        end: data.end,
        status: data.status,
        description: data.description,
      },
    });
  }

  async deleteSchedule(scheduleId: string) {
    const schedule = await this.prisma.schedule.delete({
      where: { scheduleId },
    });

    return schedule;
  }

  async getBuddySchedule(buddyId: string, startDate: Date, endDate: Date) {
    const schedules = await this.fetchBuddySchedules(
      buddyId,
      startDate,
      endDate,
    );
    const unconfirmedReservations = await this.fetchUnconfirmedReservations(
      buddyId,
      startDate,
      endDate,
    );

    return this.processSchedulesByDay(schedules, unconfirmedReservations);
  }

  private async fetchBuddySchedules(
    buddyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.prisma.schedule.findMany({
      where: {
        buddyId,
        start: { gte: startDate },
        end: { lte: endDate },
      },
    });
  }

  private async fetchUnconfirmedReservations(
    buddyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.prisma.reservationRecord.findMany({
      where: {
        buddyId,
        status: 'PENDING',
        reservationStart: { gte: startDate },
        reservationEnd: { lte: endDate },
      },
    });
  }

  private processSchedulesByDay(
    schedules: any[],
    unconfirmedReservations: any[],
  ) {
    const result = {
      busy: [] as number[],
      unconfirmed: [] as number[],
    };

    this.processBusySchedulesByDay(schedules, result);
    this.processUnconfirmedReservationsByDay(unconfirmedReservations, result);
    this.sortDailyResults(result);

    return { success: true, data: result };
  }

  private processBusySchedulesByDay(
    schedules: any[],
    result: { busy: number[] },
  ) {
    schedules.forEach((schedule: Schedule) => {
      if (schedule.status === ScheduleStatus.BUSY) {
        const currentDate = new Date(schedule.start);
        while (currentDate <= schedule.end) {
          const day = currentDate.getDate();
          if (!result.busy.includes(day)) {
            result.busy.push(day);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
  }

  private processUnconfirmedReservationsByDay(
    unconfirmedReservations: any[],
    result: { unconfirmed: number[] },
  ) {
    unconfirmedReservations.forEach((reservation: ReservationRecord) => {
      const currentDate = new Date(reservation.reservationStart);
      while (currentDate <= reservation.reservationEnd) {
        const day = currentDate.getDate();
        if (!result.unconfirmed.includes(day)) {
          result.unconfirmed.push(day);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  private sortDailyResults(result: { busy: number[]; unconfirmed: number[] }) {
    result.busy.sort((a, b) => a - b);
    result.unconfirmed.sort((a, b) => a - b);
  }

  async getPersonalSchedules(userId: string, startDate: Date, endDate: Date) {
    const user = await this.prisma.user
      .findUnique({
        where: { userId },
        select: {
          userId: true,
          buddy: {
            select: {
              buddyId: true,
            },
          },
        },
      })
      .then((user) => {
        if (!user) {
          throw new BadRequestException('User not found');
        }
        return { userId: user.userId, buddyId: user.buddy?.buddyId };
      });

    const allSchedules = await this.prisma.reservationRecord
      .findMany({
        where: {
          OR: [{ userId: user.userId }, { buddyId: user.buddyId }],
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
          reservationStart: { gte: startDate },
          reservationEnd: { lte: endDate },
        },
        include: {
          schedule: true,
        },
      })
      .then((reservations) =>
        reservations.map((r) => ({
          start: r.schedule.start,
          end: r.schedule.end,
          description: r.schedule.description + ' : ' + r.detail,
          status: r.schedule.status,
        })),
      );
    const buddySchedules = await this.prisma.schedule.findMany({
      where: {
        buddyId: user.buddyId,
        status: { not: 'AVAILABLE' },
        reservation: null,
        start: { gte: startDate },
        end: { lte: endDate },
      },
    });

    const allSchedulesWithBuddy = allSchedules
      .concat(
        buddySchedules.map((s) => ({
          start: s.start,
          end: s.end,
          description: s.description,
          status: s.status,
        })),
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const busy = [] as number[];
    const unconfirmed = [] as number[];
    allSchedulesWithBuddy.forEach((schedule) => {
      const currentDate = new Date(schedule.start);
      while (currentDate <= schedule.end) {
        const day = currentDate.getDate();
        if (schedule.status === 'BUSY' && !busy.includes(day)) {
          busy.push(day);
        } else if (
          schedule.status === 'UNCONFIRMED' &&
          !unconfirmed.includes(day)
        ) {
          unconfirmed.push(day);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return {
      success: true,
      data: { reservations: allSchedulesWithBuddy, busy, unconfirmed },
    };
  }
}
