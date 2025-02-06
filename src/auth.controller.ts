import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthRegisterRequestDto,
  AuthRegisterResponseDto,
} from './dtos/register.auth.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
} from './dtos/login.auth.dto';
import {
  AuthStatusRequestDto,
  AuthStatusResponseDto,
} from './dtos/status.auth.dto';
import {
  AuthLogoutRequestDto,
  AuthLogoutResponseDto,
} from './dtos/logout.auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getAuthHello();
  }

  @Post('register')
  register(
    @Body() authRegisterDto: AuthRegisterRequestDto,
  ): AuthRegisterResponseDto {
    return this.authService.register(authRegisterDto);
  }

  @Post('login')
  login(@Body() authLoginDto: AuthLoginRequestDto): AuthLoginResponseDto {
    return this.authService.login(authLoginDto);
  }

  @Post('logout')
  logout(@Body() authLogoutDto: AuthLogoutRequestDto): AuthLogoutResponseDto {
    return this.authService.logout(authLogoutDto);
  }

  //get verification status of user account
  @Post('status')
  status(@Body() user_id: AuthStatusRequestDto): AuthStatusResponseDto {
    return this.authService.getStatus(user_id);
  }
}
