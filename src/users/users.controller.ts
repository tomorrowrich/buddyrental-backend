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
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserInterestsDto } from './dto/update-interests.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '@app/mail/mail.service';
import { Response } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

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
  async resetPassword(@Res() res: Response, @Body() payload: ResetPasswordDto) {
    if (payload.token && payload.email && payload.password) {
      await this.usersService.resetPassword(
        payload.token,
        payload.password,
        payload.email,
      );
      return res.send({
        success: true,
        message: 'Password reset successfully',
      });
    }
    if (payload.email && payload.host) {
      const token = await this.usersService.requestPasswordReset(payload.email);
      res.send({
        success: true,
        message: 'Password reset email sent successfully',
      });
      if (token)
        await this.mailService.sendResetPasswordEmail(
          payload.email,
          `${payload.host}?token=${token.token}&email=${payload.email}`,
        );
      return;
    }
    return res.send({
      success: false,
      message: 'Invalid request',
    });
  }
}
