import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '@prisma/client';
import { AccountType } from '@app/interfaces/account_type.user.interface';
import { IsStartBeforeEnd } from '../validators/is_start_before_end.validator';

export class ScheduleQueryDto {
  @ApiPropertyOptional({
    description: 'User role',
    enum: AccountType as object,
    example: 'customer',
  })
  @IsOptional()
  @IsEnum(AccountType as object, {
    message: "Invalid role. Use 'customer' or 'buddy'.",
  })
  role?: AccountType;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ReservationStatus as object,
    example: 'PENDING',
  })
  @IsEnum(ReservationStatus as object)
  @IsOptional()
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2024-02-01',
  })
  @IsOptional()
  @Validate(IsStartBeforeEnd)
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-02-28',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Limit of items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
