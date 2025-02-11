import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

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
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'ID Card must contain only numbers' })
  idCard: string;

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
    description: 'SHA-256 hashed password',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-fA-F0-9]{64}$/, {
    message: 'Password must be a valid SHA-256 hash',
  })
  password: string;

  @ApiProperty({ description: 'User nickname', example: 'Xx_Mist3rJohn_xX' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: 'Gender of the user',
    enum: Gender,
    example: 'M',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    description: 'Date of birth of the user (as a string)',
    example: '1990-01-01',
  })
  @IsString()
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
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Zipcode', example: '12345' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: 'Zipcode must be a 5-digit number' })
  zipcode: string;

  @ApiProperty({
    description: 'Base64 encoded profile picture',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/, {
    message: 'Invalid base64-encoded image',
  })
  profilePicture?: string;
}
