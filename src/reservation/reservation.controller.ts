import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { LoggedIn, Roles } from '@app/auth/auth.decorator';
import {
  CreateReservationDto,
  CreateReservationResponseDto,
} from './dtos/create-reservation.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  async getBookingHistory(@Req() req: AuthenticatedRequest) {
    if (!req.user.buddyId) {
      throw new UnauthorizedException('User is not a buddy');
    }
    const bookingHistory = await this.reservationService.getReservationHistory(
      req.user.buddyId,
    );
    return {
      success: true,
      data: bookingHistory,
    };
  }

  @Get('history')
  @LoggedIn()
  @Roles(AuthUserRole.USER)
  @ApiOperation({
    summary: 'Get reservation history as a user',
  })
  async getUserBookingHistory(@Req() req: AuthenticatedRequest) {
    const bookingHistory = await this.reservationService.getReservationHistory(
      req.user.userId,
    );
    return {
      success: true,
      data: bookingHistory,
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
  @ApiOkResponse({
    type: CreateReservationResponseDto,
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
  @ApiOkResponse({
    type: CreateReservationResponseDto,
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
  @ApiOkResponse({
    type: CreateReservationResponseDto,
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
  @ApiOkResponse({
    type: CreateReservationResponseDto,
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
