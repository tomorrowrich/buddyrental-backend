import { ApiProperty } from '@nestjs/swagger';
import { UserGender } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsIdentityCard,
  Matches,
  IsAlpha,
  IsEnum,
  IsDateString,
  IsPostalCode,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'ID Card number', example: '123456789' })
  @IsIdentityCard()
  @IsOptional()
  citizenId?: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  @Matches(/^\+?\d+$/, {
    message:
      'Phone number must contain only numbers and an optional leading plus sign',
  })
  phone?: string;

  @ApiProperty({ description: 'User nickname, alphabet only', example: 'John' })
  @IsString()
  @IsOptional()
  @IsAlpha()
  nickname?: string;

  @ApiProperty({
    description: 'Gender of the user',
    enum: UserGender as object,
    example: 'MALE',
  })
  @IsEnum(UserGender as object)
  @IsOptional()
  gender?: UserGender;

  @ApiProperty({
    description: 'Date of birth of the user (as a string)',
    example: new Date().toISOString().split('T')[0],
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main Street',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'City of residence', example: 'Tennessee' })
  @IsString()
  @IsAlpha()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Postal code', example: '12345' })
  @IsPostalCode()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({
    description: 'URL to the profile picture',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;
}
