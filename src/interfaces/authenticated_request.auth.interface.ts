import { AuthUserRole } from '@app/auth/role.enum';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    buddyId?: string;
    adminId?: string;
  };
  roles: AuthUserRole[];
}
