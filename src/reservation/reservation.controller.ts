import { Controller, Get, Req } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { LoggedIn } from '@app/auth/auth.decorator';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('history')
  @LoggedIn()
  async getBookingHistory(@Req() req: AuthenticatedRequest) {
    const bookingHistory = await this.reservationService.getBookingHistory(
      req.user.userId,
    );
    return {
      success: true,
      data: bookingHistory,
    };
  }
}
