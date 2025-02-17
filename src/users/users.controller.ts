import { LoggedIn } from '@app/auth/auth.decorator';
import { Body, Controller, Patch, Req, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UpdateUserDto } from './dto/update-user.dto';

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
}
