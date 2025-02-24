import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('schedule')
export class ScheduleController {
  @Get()
  @ApiOperation({ summary: 'Get schedules based on query parameters' })
  @UsePipes(new ValidationPipe({ transform: true })) // Scoped ValidationPipe
  getSchedule(@Query() query: ScheduleQueryDto) {
    return {
      message: 'Success',
      query: query,
    };
  }
}
