import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'User ID of the user who is has an issue with the buddy',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Buddy ID of the buddy who is reported or has an issue',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  buddyId?: string;

  @ApiProperty({
    description: 'Category ID of the report',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Details of the report',
    example: 'Buddy was rude to me',
  })
  @IsString()
  details: string;
}
