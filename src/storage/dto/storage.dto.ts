import { ApiProperty } from '@nestjs/swagger';

export enum StorageCategory {
  CHATS = 'chats',
  PROFILES = 'profiles',
  PERSONAL = 'personal',
}

export class StorageDto {
  @ApiProperty({ description: 'Public URL of the file', required: false })
  url?: string;

  @ApiProperty({
    description: 'List of files in the specific category',
    required: false,
  })
  files?: string[];

  @ApiProperty({ description: 'Success status' })
  success?: boolean;

  @ApiProperty({ description: 'Storage category', required: false })
  category?: StorageCategory;

  @ApiProperty({ description: 'Filename of the file', required: false })
  filename?: string;

  @ApiProperty({
    description: 'Access control status',
    example: true,
    required: false,
  })
  isPublic?: boolean;

  @ApiProperty({ description: 'Access control status', required: false })
  mimetype?: string;
}
