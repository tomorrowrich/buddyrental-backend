import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { LoginDto } from './dtos/login.dto';
import { LoggedIn } from './auth.decorator';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return { success: true, message: 'User registered successfully' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @LoggedIn()
  @Get('me')
  me(@Request() req: AuthenticatedRequest) {
    return this.authService.me(req.user.userId);
  }
}
