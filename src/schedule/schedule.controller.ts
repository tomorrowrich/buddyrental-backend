import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Request,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ScheduleQueryDto } from './dtos/schedule_query.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoggedIn } from '@app/auth/auth.decorator';
import { ScheduleService } from './schedule.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get schedules based on query parameters' })
  @LoggedIn()
  @UsePipes(new ValidationPipe({ transform: true })) // Scoped ValidationPipe
  getSchedule(
    @Query() query: ScheduleQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    //return value
    return this.scheduleService.getServices(query, req.user.userId);
  }

  @Get('buddy/:buddyId')
  @ApiOperation({ summary: 'Get buddy schedules based on query parameters' })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  @LoggedIn()
  @UsePipes(new ValidationPipe({ transform: true })) // Scoped ValidationPipe
  getBuddySchedule(
    @Param('buddyId') buddyId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : new Date();
    startDate.setDate(1);
    const endDate = end ? new Date(end) : new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    return this.scheduleService.getBuddySchedule(buddyId, startDate, endDate);
  }

  @Get('personal')
  @ApiOperation({ summary: 'Get personal schedules based on query parameters' })
  @ApiQuery({ name: 'start', required: false })
  @ApiQuery({ name: 'end', required: false })
  @LoggedIn()
  @UsePipes(new ValidationPipe({ transform: true })) // Scoped ValidationPipe
  getPersonalSchedule(
    @Request() req: AuthenticatedRequest,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : new Date();
    startDate.setDate(1);
    const endDate = end ? new Date(end) : new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    console.log(startDate, endDate);
    return this.scheduleService.getPersonalSchedules(
      req.user.userId,
      startDate,
      endDate,
    );
  }
}
