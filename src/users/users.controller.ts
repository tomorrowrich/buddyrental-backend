import { LoggedIn } from '@app/auth/auth.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserInterestsDto } from './dto/update-interests.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @LoggedIn()
  @Patch('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() payload: UpdateUserDto,
  ) {
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(payload, { type: 'body' });

    await this.usersService.update(req.user.userId, payload);
  }

  @Put('interests')
  @LoggedIn()
  async updateInterests(
    @Req() req: AuthenticatedRequest,
    @Body() payload: UpdateUserInterestsDto,
  ) {
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(payload, { type: 'body' });
    return await this.usersService.updateInterests(
      req.user.userId,
      payload.interests,
    );
  }

  @Get(':userId')
  @LoggedIn()
  async getUserId(@Param('userId') userId: string) {
    return await this.usersService.findOne(userId);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Reset user password using token, email and new password',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() payload: ResetPasswordDto) {
    if (payload.token && payload.email && payload.password) {
      await this.usersService.resetPassword(
        payload.token,
        payload.password,
        payload.email,
      );
      return {
        success: true,
        message: 'Password reset successfully',
      };
    }
    if (payload.email) {
      await this.usersService.requestPasswordReset(payload.email);
      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    }
    return {
      success: false,
      message: 'Invalid request',
    };
  }
}
