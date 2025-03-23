import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedIn } from '@app/auth/auth.decorator';
import { ScheduleService } from './schedule.service';

@ApiTags('Schedule')
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
