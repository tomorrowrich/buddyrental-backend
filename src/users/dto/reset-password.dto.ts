import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsHash, IsOptional, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The token used to reset the password',
    example: 'hash32bytes',
    required: false,
  })
  @IsHash('sha256')
  @IsOptional()
  token: string;

  @ApiProperty({
    description: 'The new password for the user',
    example: 'newpassword',
    required: false,
  })
  @IsStrongPassword()
  @IsOptional()
  password?: string;
}
