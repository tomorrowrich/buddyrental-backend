import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest } from 'express';

// Imported from NestJS documentation: https://docs.nestjs.com/security/authentication
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
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
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = { userId: payload.sub, email: payload.email };
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
