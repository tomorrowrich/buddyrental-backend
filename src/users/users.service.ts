import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
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
    return await this.prisma.user.findMany({
      omit: { password: true },
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { userId: userId, deletedAt: null },
      where: { userId: userId },
      omit: { password: true },
    });
  }

  async findUserWithEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email, deletedAt: null },
      omit: { password: true },
    });
    return user;
  }

  async findUnverifiedUsers() {
    return await this.prisma.user.findMany({
      where: { verified: false, deletedAt: null },
      omit: { password: true },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    if (
      updateUserDto.gender &&
      !Object.values(UserGender).includes(updateUserDto.gender)
    ) {
      throw new BadRequestException('Invalid gender');
    }
    const userExists = await this.prisma.user.findUnique({
      where: { userId: userId, deletedAt: null },
      omit: { password: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    
    return await this.prisma.user.update({
      where: { userId: userId, deletedAt: null },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  async verifyUser(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { userId, deletedAt: null },
      omit: { password: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    if (userExists.verified) {
      throw new BadRequestException('User already verified');
    }

    return await this.prisma.user.update({
      where: { userId, deletedAt: null, verified: false },
      data: { verified: true },
      omit: { password: true },
    });
  }

  async rejectUser(userId: string, _reason: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { userId, deletedAt: null },
      omit: { password: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: { userId, deletedAt: null },
      data: { verified: false },
      omit: { password: true },
    });
  }

  async remove(userId: string) {
    const userExists = await this.prisma.user.findUnique({
      where: { userId, deletedAt: null },
      omit: { password: true },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.user.update({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
      omit: { password: true },
    });
  }
}
