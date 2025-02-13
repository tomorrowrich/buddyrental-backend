import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '@app/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  getBookingHistory(@Req() req: AuthenticatedRequest) {
    return this.reservationService.getBookingHistory(req.user.userId);
  }
}
