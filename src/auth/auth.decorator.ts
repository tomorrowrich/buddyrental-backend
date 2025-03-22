import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthUserRole } from './role.enum';
import { RoleGuard } from './role.guard';

export function LoggedIn() {
  return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard, RoleGuard));
}

export function Roles(...roles: AuthUserRole[]) {
  return SetMetadata('roles', roles);
}
