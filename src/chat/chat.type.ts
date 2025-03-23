import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum ChatMessageMetaType {
  TEXT = 'text',
  IMAGE = 'image',
  APPOINTMENT = 'appointment',
  FILE = 'file',
}

export class ChatMessageMeta {
  @IsUUID()
  metaId: string;

  @IsDateString()
  timestamp: string;

  @IsEnum(ChatMessageMetaType)
  type: ChatMessageMetaType;

  @IsString()
  @IsOptional()
  @ValidateIf((o: ChatMessageMeta) => o.type !== ChatMessageMetaType.TEXT)
  content?: string;
}

export class ChatMessage {
  @IsUUID()
  trackId: string;

  @IsUUID()
  chatId: string;

  @IsUUID()
  senderId: string;

  @IsString()
  content: string;

  @ValidateNested()
  meta: ChatMessageMeta;
}

export interface ChatGatewayAuthPayload {
  token: string;
  userid: string;
}
