import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty({
    description: 'If the user will be accepted',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  accept: boolean;

  @ApiProperty({
    description: 'User ID',
    example: 'd201fa25-3e24-4644-98a1-350f578af7ab',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    required: false,
    example: 'Suspicious Profile',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((dto: VerifyDto) => dto.accept === false)
  reason?: string;
}
