import { CredentialsService } from '@app/credentials/credentials.service';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Credential } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private credentialsService: CredentialsService) {}

  async register(registerDto: RegisterDto): Promise<Credential> {
    return await this.credentialsService.create(registerDto);
  }
}
