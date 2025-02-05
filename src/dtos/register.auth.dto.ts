import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../interfaces/account_type.user.interface';

export class AuthRegisterRequestDto {
  @ApiProperty({ example: 'user' })
  account_type: AccountType;

  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'gneurshk' })
  password: string;
}

export class AuthRegisterResponseDto {
  success: boolean;
  data: {
    user_id: string;
  };
  message: string;
}
