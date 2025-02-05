import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { AuthLoginRequestDto, AuthLoginResponseDto } from 'dtos/login.auth.dto';
import { AuthLogoutRequestDto, AuthLogoutResponseDto } from 'dtos/logout.auth.dto';
import { AuthRegisterRequestDto, AuthRegisterResponseDto } from 'dtos/register.auth.dto';
import { AuthStatusRequestDto, AuthStatusResponseDto } from 'dtos/status.auth.dto';

@Injectable()
export class AuthService {
  getAuthHello(): string {
    return 'Hello  /auth!';
  }

  register(authRegisterDto: AuthRegisterRequestDto): AuthRegisterResponseDto {
    if (authRegisterDto.email === "") {
        // value is empty string
        throw new NotFoundException({ success: false, message: 'Email cannot be empty.' });
    }

    if(authRegisterDto.email.length > 254) {
        //value exceeds given length
        throw new BadRequestException({ success: false, message: 'Email cannot exceed 254 characters.'})
    }

    if(!String(authRegisterDto.email)
        .toLowerCase()
        .match(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        ))
    {
        //value is not valid email
        throw new BadRequestException({ success: false, message: 'Email is not valid.'});
    }

    throw new NotImplementedException;
  }

  login(authLoginDto: AuthLoginRequestDto): AuthLoginResponseDto {
    throw new NotImplementedException;
  }

  logout(authLoginDto: AuthLogoutRequestDto): AuthLogoutResponseDto {
    throw new NotImplementedException;
  }

  getStatus(user_id: AuthStatusRequestDto): AuthStatusResponseDto {
    throw new NotImplementedException;
  }

}
