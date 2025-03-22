import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  Validate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '@prisma/client';
import { IsStartBeforeEnd } from '../validators/is_start_before_end.validator';

export class ScheduleQueryDto {
  @ApiProperty({
    description: 'The ID of the buddy to query schedule',
  })
  @IsUUID()
  buddyId: string;

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
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-02-28',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

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
