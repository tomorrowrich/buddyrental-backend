import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { Prisma, UserGender } from '@prisma/client';
import { RegisterDto } from '@app/auth/dtos/register.dto';
import { hash, verify } from 'argon2';
import { createPaginator } from 'prisma-pagination';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedOutputDto } from '@app/interfaces/paginated-output.dto';

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

  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ): Promise<PaginatedOutputDto<UserResponseDto>> {
    const paginate = createPaginator({ perPage });

    return paginate<UserResponseDto, Prisma.UserFindManyArgs>(
      this.prisma,
      {
        omit: { password: true },
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      {
        page,
      },
    );
  }

  async findOne(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { userId: userId, deletedAt: null },
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

  async findUnverifiedUsers(
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginatedOutputDto<UserResponseDto>> {
    const paginate = createPaginator({ perPage, page });

    const unverified = await paginate<UserResponseDto, Prisma.UserFindManyArgs>(
      this.prisma,
      {
        where: { verified: false, deletedAt: null },
        omit: { password: true },
      },
    );
    return unverified;
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

  async updateInterests(userId: string, tagIds: string[]) {
    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('At least one tag is required');
    }
    const tags = await this.prisma.tag.findMany({
      where: { tagId: { in: tagIds } },
    });

    if (tags.length !== tagIds.length) {
      throw new NotFoundException('One or more tags not found');
    }

    if (tags.length > 5) {
      throw new BadRequestException('You cannot assign more than 5 tags');
    }

    const user = await this.prisma.user.findFirst({
      where: { userId },
      include: { interests: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assignedUser = await this.prisma.user.update({
      where: { userId },
      data: {
        interests: {
          set: tags,
        },
      },
      include: { interests: true },
    });

    const interests = assignedUser.interests.map((interest) => interest.name);

    return {
      success: true,
      message: 'Interests updated successfully',
      interests,
    };
  }
}
