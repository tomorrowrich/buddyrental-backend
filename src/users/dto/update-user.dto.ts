import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  displayName?: string;

  @ApiProperty({ example: 'I love coding and coffee.', required: false })
  description?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profilePicture?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  address?: string;

  @ApiProperty({ example: '0123456789', required: false })
  phoneNumber?: string;
}
