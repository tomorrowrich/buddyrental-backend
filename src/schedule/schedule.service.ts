import { PrismaService } from '@app/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';
import { Prisma, ReservationRecord } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';

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
}
