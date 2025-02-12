import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { AuthGuard } from './auth.guard';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { LoginDto } from './dtos/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('signin')
  async signin(@Body() loginDto: LoginDto) {
    this.authService.validateClientKey(loginDto.clientKey);
    return this.authService.signin({
      email: loginDto.email,
      password: loginDto.password,
    });
  }

  @ApiBearerAuth()
  @Get('verify_status')
  @UseGuards(AuthGuard)
  verify(@Request() req: AuthenticatedRequest) {
    return this.authService.verifyStatus(req.userId);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(AuthGuard)
  me(@Request() req: AuthenticatedRequest) {
    return this.authService.me(req.userId);
  }
}
