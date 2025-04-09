import { LoggedIn } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@app/auth/auth.service';

@ApiTags('NOTIFICATIONS')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly auth: AuthService,
  ) {}

  @Sse('stream')
  @ApiOperation({
    summary: 'Subscribe to server-sent events (SSE) notifications',
    description:
      'Establishes a persistent connection to receive real-time notifications via SSE',
    responses: {
      default: {
        description: 'SSE',
        headers: {
          'Content-Type': {
            schema: {
              type: 'string',
              example: 'text/event-stream',
            },
          },
        },
      },
    },
  })
  async sse(@Query('token') token: string): Promise<Observable<any>> {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }
    const { userId } = await this.auth.verfyToken(token).catch(() => {
      throw new UnauthorizedException('Invalid token');
    });
    return this.notificationsService.subscribe(userId);
  }

  @Get()
  @LoggedIn()
  async getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const resp = await this.notificationsService.getNotifications(
      req.user.userId,
      take ? parseInt(take) : 10,
      skip ? parseInt(skip) : 0,
    );
    return { success: true, ...resp };
  }

  @Get('unread')
  @LoggedIn()
  async getUnreadNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.notificationsService.getUnreadNotifications(
      req.user.userId,
      take ? parseInt(take) : 10,
      skip ? parseInt(skip) : 0,
    );
  }

  @Put(':id/read')
  @LoggedIn()
  async readNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.readNotification(
      req.user.userId,
      notificationId,
    );
  }

  @Post('read-all')
  @LoggedIn()
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
}
