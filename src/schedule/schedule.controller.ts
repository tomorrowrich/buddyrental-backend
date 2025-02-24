import { Controller, Get, Query } from '@nestjs/common';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('schedule')
export class ScheduleController {
  @Get()
  @ApiOperation({ summary: 'Get schedules based on query parameters' })
  getSchedule(@Query() query: ScheduleQueryDto) {
    return query.role;
  }
}
