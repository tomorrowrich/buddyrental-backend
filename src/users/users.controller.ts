import { LoggedIn } from '@app/auth/auth.decorator';
import {
  Body,
  Controller,
  Patch,
  Put,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserInterestsDto } from './dto/update-interests.dto';

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
}
