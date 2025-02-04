import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterRequestDto, AuthRegisterResponseDto } from 'dtos/register.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getAuthHello();
  }

  @Post('register')
  register(@Body() authRegisterDto: AuthRegisterRequestDto): AuthRegisterResponseDto {
    if (authRegisterDto.email === "") {
        // strValue was empty string
        throw new NotFoundException({ success: false, message: 'User not found' });
    }

    return this.authService.register(authRegisterDto);
  }

}