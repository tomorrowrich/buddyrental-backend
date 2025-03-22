import { ApiProperty } from '@nestjs/swagger';
import { Schedule, ReservationRecord } from '@prisma/client';
import { IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty()
  @IsUUID()
  readonly buddyId: string;

  @ApiProperty()
  @IsNumber()
  readonly price: number;

  @ApiProperty()
  @IsDateString()
  readonly reservationStart: string;

  @ApiProperty()
  @IsDateString()
  readonly reservationEnd: string;
}

export class CreateReservationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: { schedule: Schedule; reservation: ReservationRecord };
}
