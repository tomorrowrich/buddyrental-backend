import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateUserInterestsDto {
  @ApiProperty({
    required: true,
    example: [
      '112d9085-f778-4b03-80ef-ba489d5192e0',
      '30100b79-c3a8-4e26-8c58-515c35200699',
    ],
    description: 'List of tag IDs to be interested in',
  })
  @IsArray({ message: 'Interests must be an array of strings' })
  interests: string[];
}
