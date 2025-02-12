import { ApiProperty } from '@nestjs/swagger';

export class CreateCredentialDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password: string;
}
