import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { PrismaService } from '@app/prisma/prisma.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthUserRole } from './role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const requiredRoles = this.reflector.getAllAndOverride<AuthUserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRecord = await this.prisma.user.findUnique({
      where: {
        userId: user.userId,
      },
      include: { buddy: true, Admin: true },
    });
    if (!userRecord) {
      return false;
    }

    request.user = {
      ...request.user,
      buddyId: userRecord.buddy?.buddyId,
      adminId: userRecord.Admin?.adminId,
    };

    const userRole = {
      user: true,
      buddy: userRecord.buddy !== null && userRecord.buddy.deletedAt === null,
      admin: userRecord.Admin !== null && userRecord.Admin.deletedAt === null,
    };

    const hasRequiredRole = requiredRoles.every((role) => {
      return userRole[role] === true;
    });
    return hasRequiredRole;
  }
}
