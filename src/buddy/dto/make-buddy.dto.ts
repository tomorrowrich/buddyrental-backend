import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class MakeBuddyDto {
  @ApiProperty({ example: 100, description: 'Minimum price the buddy charges' })
  @IsNumber()
  @Min(0)
  minPrice: number;

  @ApiProperty({ example: 500, description: 'Maximum price the buddy charges' })
  @IsNumber()
  @Min(0)
  maxPrice: number;
}
