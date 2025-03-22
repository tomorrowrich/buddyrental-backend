import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthUserRole } from './role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<AuthUserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userRole = {
      user: true,
      buddy: user.buddyId && true,
      admin: user.adminId && true,
    };

    const hasRequiredRole = requiredRoles.every((role) => {
      return userRole[role] === true;
    });
    return hasRequiredRole;
  }
}
