import { PrismaService } from '@app/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, ReservationRecord, ScheduleStatus } from '@prisma/client';
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
    const schedule = await this.prisma.schedule
      .create({
        data: {
          buddyId,
          start: startDate,
          end: endDate,
          status: status,
          description: description,
        },
      })
      .then((schedule) => schedule);

    return schedule;
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
    const schedule = await this.prisma.schedule.update({
      where: { scheduleId },
      data: {
        start: data.start,
        end: data.end,
        status: data.status,
        description: data.description,
      },
    });

    return schedule;
  }

  async deleteSchedule(scheduleId: string) {
    const schedule = await this.prisma.schedule.delete({
      where: { scheduleId },
    });

    return schedule;
  }
}
