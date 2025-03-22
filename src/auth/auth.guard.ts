import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UsersService } from '@app/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token, {
        secret: this.config.get<string>('auth.secret_key'),
      });

      const user = await this.userService.getAllIdentities(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = {
        userId: user.userId,
        email: payload.email,
        adminId: user.adminId,
        buddyId: user.buddyId,
      };
    } catch {
      throw new UnauthorizedException('Unable to authorize token');
    }
    return true;
  }

  private extractTokenFromHeader(request: ExpressRequest): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
    return authHeader.split(' ')[1];
  }
}
