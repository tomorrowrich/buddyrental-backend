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
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Authentication token for SSE connection',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream established successfully',
    headers: {
      'Content-Type': {
        schema: {
          type: 'string',
          example: 'text/event-stream',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token is missing or invalid',
  })
  async sse(@Query('token') token: string): Promise<Observable<any>> {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }
    const { userId } = await this.auth.verifyToken(token).catch(() => {
      throw new UnauthorizedException('Invalid token');
    });
    return this.notificationsService.subscribe(userId);
  }

  @Get()
  @LoggedIn()
  @ApiOperation({
    summary: 'Get all notifications',
    description:
      'Retrieves all notifications for the authenticated user with pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of notifications to retrieve (default: 10)',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of notifications to skip (default: 0)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
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
  @ApiOperation({
    summary: 'Get unread notifications',
    description:
      'Retrieves all unread notifications for the authenticated user with pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of notifications to retrieve (default: 10)',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of notifications to skip (default: 0)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notifications retrieved successfully',
  })
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
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a specific notification as read for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Notification ID to mark as read',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
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
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications as read for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
  })
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
}
