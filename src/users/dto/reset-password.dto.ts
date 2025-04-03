import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsHash,
  IsOptional,
  IsStrongPassword,
  Matches,
} from 'class-validator';

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

  @ApiProperty({
    description: 'Target url host for the password reset link',
    example: 'http://localhost:3000/reset-password',
    required: false,
  })
  @IsOptional()
  @Matches(
    /^(https?:\/\/)?(([\w-]+):([\w-]+)@)?([\da-z.-]+)(:\d+)?([/\w .-]*)*\/?$/,
  )
  @IsOptional()
  host?: string;
}
