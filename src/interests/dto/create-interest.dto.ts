import { ApiProperty } from '@nestjs/swagger';

export class CreateInterestDto {
  @ApiProperty({
    required: true,
    example: 'Music',
    description: 'The name of the interest to be created',
  })
  name: string;
}
