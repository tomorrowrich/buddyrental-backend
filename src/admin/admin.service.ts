import { UsersService } from '@app/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { VerifyDto, VerifyMethod } from './dtos/verify.dto';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async getVerify(): Promise<Omit<User, 'password'>[]> {
    return (await this.usersService.findUnverified()).map(
      ({ password: _password, ...profile }) => profile,
    );
  }

  async verifyUser(verifyDto: VerifyDto) {
    const user = await this.usersService.findOne(verifyDto.userId);
    if (user.verified) {
      throw new BadRequestException('User already verified');
    }

    if ((verifyDto.method = VerifyMethod.ACCEPT)) {
      return this.acceptUser(verifyDto.userId);
    }

    if ((verifyDto.method = VerifyMethod.REJECT)) {
      return this.rejectUser(verifyDto.userId);
    }
  }

  async rejectUser(userId: string) {
    const user = await this.usersService.remove(userId);
    const { password: _password, ...profile } = user;
    return profile;
  }
  async acceptUser(userId: string) {
    const user = await this.usersService.update(userId, { verified: true });
    const { password: _password, ...profile } = user;
    return profile;
  }
}
