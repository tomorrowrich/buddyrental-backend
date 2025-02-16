import { Injectable, ValidationPipe } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserGender } from '@prisma/client';
import { RegisterDto } from '@app/auth/dtos/register.dto';
import { hash, verify } from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(payload: RegisterDto) {
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(payload, { type: 'body' });

    if (!payload.password.startsWith('$argon2')) {
      payload.password = await hash(payload.password);
    }

    const user = await this.prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        citizenId: payload.citizenId,
        email: payload.email,
        phoneNumber: payload.phone,
        password: payload.password,
        displayName: payload.nickname,
        gender: payload.gender as UserGender,
        dateOfBirth: payload.dateOfBirth,
        address: payload.address,
        city: payload.city,
        postalCode: payload.postalCode,
      },
      omit: {
        password: true,
      },
    });

    return user;
  }

  async verifyPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return false;
    }

    return await verify(user.password, password);
  }

  async findAll() {
    return await this.prisma.user.findMany({ omit: { password: true } });
  }

  async findOne(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { userId: userId },
      omit: { password: true },
    });
  }

  async findUserWithEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
      omit: { password: true },
    });
    return user;
  }

  async findUnverifiedUsers() {
    return await this.prisma.user.findMany({
      where: { verified: false },
      omit: { password: true },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { userId: userId },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  async remove(userId: string) {
    return await this.prisma.user.delete({
      where: { userId },
      omit: { password: true },
    });
  }
}
