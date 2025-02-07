import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { Credential } from '@prisma/client';

@Injectable()
export class CredentialsService {
  constructor(private prisma: PrismaService) {}

  async create(createCredentialDto: CreateCredentialDto): Promise<Credential> {
    return await this.prisma.credential.create({ data: createCredentialDto });
  }

  async findAll(): Promise<Credential[]> {
    return await this.prisma.credential.findMany();
  }

  async findOne(email: string): Promise<Credential> {
    return await this.prisma.credential.findUniqueOrThrow({ where: { email } });
  }

  async update(
    email: string,
    updateCredentialDto: UpdateCredentialDto,
  ): Promise<Credential> {
    return await this.prisma.credential.update({
      where: { email },
      data: updateCredentialDto,
    });
  }

  async remove(email: string): Promise<Credential> {
    return await this.prisma.credential.delete({ where: { email } });
  }
}
