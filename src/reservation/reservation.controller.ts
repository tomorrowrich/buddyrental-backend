import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Param,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { LoggedIn, Roles } from '@app/auth/auth.decorator';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from './dtos/create-reservation.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUserRole } from '@app/auth/role.enum';

@ApiTags('Reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('buddy-history')
  @LoggedIn()
  @Roles(AuthUserRole.BUDDY)
  @ApiOperation({
    summary: 'Get reservation history as a buddy',
  })
  @ApiQuery({ name: 'take', type: () => Number, required: false })
  @ApiQuery({ name: 'skip', type: () => Number, required: false })
  async getBookingHistory(
    @Req() req: AuthenticatedRequest,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    if (!req.user.buddyId) {
      throw new UnauthorizedException('User is not a buddy');
    }
    const { data, totalCount } =
      await this.reservationService.getReservationHistory(
        req.user.buddyId,
        +take || 10,
        +skip || 0,
      );
    return {
      success: true,
      data,
      take: +take || 10,
      skip: +skip || 0,
      totalCount,
    };
  }

  @Get('history')
  @LoggedIn()
  @Roles(AuthUserRole.USER)
  @ApiOperation({
    summary: 'Get reservation history as a user',
  })
  @ApiQuery({ name: 'take', type: () => Number, required: false })
  @ApiQuery({ name: 'skip', type: () => Number, required: false })
  async getUserBookingHistory(
    @Req() req: AuthenticatedRequest,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    const { data, totalCount } =
      await this.reservationService.getReservationHistory(
        req.user.userId,
        +take || 10,
        +skip || 0,
      );
    return {
      success: true,
      data,
      take: +take || 10,
      skip: +skip || 0,
      totalCount,
    };
  }

  @Post()
  @LoggedIn()
  @ApiOperation({
    summary: 'Create Reservation to buddy with unconfirmed schedule',
  })
  @ApiOkResponse({
    type: CreateReservationResponseDto,
  })
  async createReservation(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateReservationDto,
  ) {
    const reservation = await this.reservationService.createReservation(
      req.user.userId,
      payload,
    );
    return {
      success: true,
      data: reservation,
    };
  }

  @Patch('confirm/:reservationId')
  @LoggedIn()
  @Roles(AuthUserRole.BUDDY)
  @ApiOperation({
    summary: 'Mark reservation as confirmed',
  })
  async updateReservation(
    @Req() req: AuthenticatedRequest,
    @Param('reservationId') id: string,
  ) {
    const reservation = await this.reservationService.confirmReservation(
      req.user.userId,
      id,
    );
    return {
      success: true,
      data: reservation,
    };
  }

  @Patch('reject/:reservationId')
  @LoggedIn()
  @Roles(AuthUserRole.BUDDY)
  @ApiOperation({
    summary: 'Mark reservation as rejected',
  })
  async rejectReservation(
    @Req() req: AuthenticatedRequest,
    @Param('reservationId') id: string,
  ) {
    const reservation = await this.reservationService.rejectReservation(
      req.user.userId,
      id,
    );
    return {
      success: true,
      data: reservation,
    };
  }

  @Patch('cancel/:reservationId')
  @LoggedIn()
  @ApiOperation({
    summary: 'Cancel Reservation',
  })
  async cancelReservation(
    @Req() req: AuthenticatedRequest,
    @Param('reservationId') id: string,
  ) {
    const reservation = await this.reservationService.cancelReservation(
      req.user.userId,
      id,
    );
    return {
      success: true,
      data: reservation,
    };
  }

  @Patch('complete/:reservationId')
  @LoggedIn()
  @ApiOperation({
    summary: 'Mark Reservation as Completed',
  })
  async completeReservation(
    @Req() req: AuthenticatedRequest,
    @Param('reservationId') id: string,
  ) {
    const reservation = await this.reservationService.completeReservation(
      req.user.userId,
      id,
    );
    return {
      success: true,
      data: reservation,
    };
  }
}
