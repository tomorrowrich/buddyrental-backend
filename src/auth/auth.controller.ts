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

  @ApiTags('auth')
  @Get('verify')
  @UseGuards(AuthGuard)
  verify(@Request() req: AuthenticatedRequest) {
    return this.authService.verify(req.username);
  }
}
