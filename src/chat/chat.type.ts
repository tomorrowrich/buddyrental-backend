import { IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  buddyId: string;
}

export class ChatMessage {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  chatId: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  content: string;

  @IsObject()
  meta: {
    id: string;
    timestamp: Date;
    type: 'text' | 'image' | 'appointment' | 'file';
    content: string;
  };
}

export interface ChatGatewayAuthPayload {
  token: string;
  userid: string;
}
