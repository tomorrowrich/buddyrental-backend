import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../interfaces/account_type.user.interface';

export class AuthStatusRequestDto {
  @ApiProperty({ example: '331541d6-617d-4464-b7d0-9b346b87f41c' })
  user_id: string;
}

export class AuthStatusResponseDto {
  success: boolean;
  data: {
    verified: boolean;
  };
  message: string;
}
