import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  findOne(userId: string) {
    return this.prisma.user.findUnique({ where: { userId } });
  }

  update(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { userId }, data: updateUserDto });
  }

  remove(userId: string) {
    return this.prisma.user.delete({ where: { userId } });
  }
}
