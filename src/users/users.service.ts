import { Injectable, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(createUserDto, { type: 'body' });
    const user = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        citizenId: createUserDto.idCard,
        email: createUserDto.email,
        phoneNumber: createUserDto.phone,
        password: createUserDto.password,
        displayName: createUserDto.nickname,
        gender: createUserDto.gender,
        dateOfBirth: createUserDto.dateOfBirth,
        address: createUserDto.address,
        city: createUserDto.city,
        zipcode: createUserDto.zipcode,
      },
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findOne(userId: string): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { userId: userId },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { userId: userId },
      data: updateUserDto,
    });
  }

  async remove(userId: string): Promise<User> {
    return await this.prisma.user.delete({ where: { userId } });
  }
}
