import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  username: string;
}
