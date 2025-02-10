import { CredentialsService } from '@app/credentials/credentials.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Credential } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private credentialsService: CredentialsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Credential> {
    return await this.credentialsService.create(registerDto);
  }

  async signin(loginDto: LoginDto): Promise<string> {
    const cred = await this.credentialsService.findOne(loginDto.email);
    if (cred?.password !== loginDto.password) {
      throw new UnauthorizedException();
    }
    return await this.jwtService.signAsync(
      { username: cred.userId },
      { expiresIn: this.config.get<string | number>('auth.expiration_time') },
    );
  }

  async verify(email: string): Promise<boolean> {
    return (await this.credentialsService.findOne(email)).verified;
  }
}
