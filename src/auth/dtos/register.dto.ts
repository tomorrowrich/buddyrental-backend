import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
  IsAlpha,
  IsDateString,
  IsUrl,
  IsPostalCode,
  IsIdentityCard,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserGender } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'ID Card number', example: '123456789' })
  @IsIdentityCard()
  @IsNotEmpty()
  citizenId: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d+$/, {
    message:
      'Phone number must contain only numbers and an optional leading plus sign',
  })
  phone: string;

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

  @ApiProperty({ description: 'User nickname, alphabet only', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @IsAlpha()
  nickname: string;

  @ApiProperty({
    description: 'Gender of the user',
    enum: UserGender as object,
    example: 'MALE',
  })
  @IsEnum(UserGender as object)
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'Date of birth of the user (as a string)',
    example: new Date().toISOString(),
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'City of residence', example: 'Tennessee' })
  @IsString()
  @IsAlpha()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Postal code', example: '12345' })
  @IsPostalCode()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'URL to the profile picture',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;
}
