import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateBuddyDto {
  @ApiProperty({ example: 100, description: 'Minimum price the buddy charges' })
  @IsNumber()
  @Min(0)
  minPrice: number;

  @ApiProperty({ example: 500, description: 'Maximum price the buddy charges' })
  @IsNumber()
  @Min(0)
  maxPrice: number;

  @ApiProperty({ description: 'buddy description' })
  @IsString()
  description: string;
}
