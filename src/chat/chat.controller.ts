import { LoggedIn } from '@app/auth/auth.decorator';
import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @LoggedIn()
  @Get()
  @ApiOperation({
    summary: 'Get list of opened chat',
  })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async getChatLists(
    @Req() req: AuthenticatedRequest,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    const { data, totalCount } = await this.chatService.getChats(
      req.user.userId,
      +take || 10,
      +skip || 0,
    );
    return {
      success: true,
      data,
      totalCount,
      take: +take || 10,
      skip: +skip || 0,
    };
  }

  @LoggedIn()
  @Post(':buddyId')
  @ApiOperation({
    summary: 'Create a new chat using target chat buddyID',
  })
  async createChat(
    @Req() req: AuthenticatedRequest,
    @Param('buddyId') buddyId: string,
  ) {
    const data = await this.chatService.createChat(req.user.userId, buddyId);
    return {
      success: true,
      data: {
        chatId: data.id,
      },
    };
  }

  @LoggedIn()
  @ApiOperation({
    summary: 'Get chat history',
  })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @Get(':chatId/messages')
  async getHistory(
    @Param('chatId') chatId: string,
    @Req() req: AuthenticatedRequest,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    const { data, totalCount } = await this.chatService.getHistory(
      req.user.userId,
      chatId,
      +take || 50,
      +skip || 0,
    );
    return {
      success: true,
      data,
      take: +take || 50,
      skip: +skip || 0,
      totalCount,
    };
  }
}
