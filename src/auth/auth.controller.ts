import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { ApiTags } from '@nestjs/swagger';

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
  async signin(
    @Body() body: { clientKey: string; email: string; password: string },
  ) {
    this.authService.validateClientKey(body.clientKey);
    return this.authService.signin({
      email: body.email,
      password: body.password,
    });
  }
}
