import { LoggedIn } from '@app/auth/auth.decorator';
import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Chat, ChatMessage } from '@prisma/client';
import { ChatService } from './chat.service';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { ApiQuery } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @LoggedIn()
  @Get()
  async getChatLists(@Req() req: AuthenticatedRequest): Promise<Chat[]> {
    return this.chatService.getChats(req.user.userId);
  }

  @LoggedIn()
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @Get(':chatId/messages')
  async getHistory(
    @Param('chatId') chatId: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<ChatMessage[]> {
    return this.chatService.getHistory(req.user.userId, chatId, limit, offset);
  }
}
