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
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('auth')
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiTags('auth')
  @Post('signin')
  async signin(@Body() loginDto: LoginDto) {
    this.authService.validateClientKey(loginDto.clientKey);
    return this.authService.signin({
      email: loginDto.email,
      password: loginDto.password,
    });
  }

  @ApiTags('auth')
  @Get('verify_status')
  @UseGuards(AuthGuard)
  verify(@Request() req: AuthenticatedRequest) {
    return this.authService.verifyStatus(req.email);
  }
}
