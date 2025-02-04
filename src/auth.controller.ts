import { BadRequestException, NotFoundException, Body, Controller, Get, Post } from '@nestjs/common';
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
    return this.authService.register(authRegisterDto);
  }

}