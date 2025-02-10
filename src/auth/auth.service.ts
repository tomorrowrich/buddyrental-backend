import { CredentialsService } from '@app/credentials/credentials.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Credential } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly CLIENT_KEY: string;
  constructor(
    private credentialsService: CredentialsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    const temp = this.config.get<string>('client_key');

    if (!temp) {
      throw new Error('CLIENT_KEY is not defined in the environment variables');
    }

    this.CLIENT_KEY = temp;
  }

  async register(registerDto: RegisterDto): Promise<Credential> {
    const existingUser = await this.credentialsService.findOne(
      registerDto.email,
    );
    if (existingUser) {
      throw new Error('Duplicate credential');
    } else return await this.credentialsService.create(registerDto);
  }

  validateClientKey(clientKey: string): void {
    if (clientKey !== this.CLIENT_KEY) {
      throw new UnauthorizedException('Invalid client key');
    }
  }

  async signin(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const cred = await this.credentialsService.findOne(data.email);
    if (!cred) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (cred?.password !== data.password) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign(
      { sub: cred.userId, email: cred.email },
      { expiresIn: this.config.get<string | number>('auth.expiration_time') },
    );

    return { accessToken };
  }

  async verifyStatus(email: string): Promise<boolean> {
    const cred = await this.credentialsService.findOne(email);
    if (!cred) {
      throw new UnauthorizedException();
    }
    return cred.verified;
  }
}
