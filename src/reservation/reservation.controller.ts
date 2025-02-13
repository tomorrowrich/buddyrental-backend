import { Controller, Get, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('history/:customerId')
  getBookingHistory(@Param('customerId') customerId: string) {
    return this.reservationService.getBookingHistory(customerId);
  }
}
