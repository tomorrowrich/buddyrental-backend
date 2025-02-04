import { Injectable } from '@nestjs/common';
import { AuthRegisterRequestDto, AuthRegisterResponseDto } from 'dtos/register.auth.dto';

@Injectable()
export class AuthService {
  getAuthHello(): string {
    return 'Hello  /auth!';
  }

  register(authRegisterDto: AuthRegisterRequestDto): AuthRegisterResponseDto {
    return {
        success: false,
        data: {},
        message: "Not implemented"
    };
  }

}
