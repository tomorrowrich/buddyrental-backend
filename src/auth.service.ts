import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { AuthRegisterRequestDto, AuthRegisterResponseDto } from 'dtos/register.auth.dto';

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

    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authRegisterDto.email))
    {
        //value is not valid email
        throw new BadRequestException({ success: false, message: 'Email is not valid.'});
    }

    throw new NotImplementedException;
  }

}
