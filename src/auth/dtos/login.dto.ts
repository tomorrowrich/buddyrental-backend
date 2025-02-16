import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The client key',
    example: 'DEFAULT_CLIENT_KEY',
  })
  clientKey: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Password must be at least 8 characters long and include at least one upper case, one lower case, one numeric, and one special character',
    example: 'Password123!',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least one upper case, one lower case, one numeric, and one special character',
  })
  password: string;
}
