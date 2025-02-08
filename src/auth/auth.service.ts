import { CredentialsService } from '@app/credentials/credentials.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Credential } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private credentialsService: CredentialsService,
    private jwtService: JwtService,
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
      { expiresIn: '72h' },
    );
  }
}
