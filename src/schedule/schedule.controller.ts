import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';
import { ApiOperation } from '@nestjs/swagger';
import { LoggedIn } from '@app/auth/auth.decorator';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get schedules based on query parameters' })
  @LoggedIn()
  @UsePipes(new ValidationPipe({ transform: true })) // Scoped ValidationPipe
  getSchedule(@Query() query: ScheduleQueryDto) {
    //return value
    return this.scheduleService.getServices(query);
  }
}
