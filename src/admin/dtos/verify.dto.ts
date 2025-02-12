import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VerifyMethod {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export class VerifyDto {
  @ApiProperty({
    description: 'Method to update the user status',
    enum: VerifyMethod,
  })
  @IsEnum(VerifyMethod)
  @IsNotEmpty()
  method: VerifyMethod;

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
  @ValidateIf((dto: VerifyDto) => dto.method === VerifyMethod.REJECT)
  reason?: string;
}
