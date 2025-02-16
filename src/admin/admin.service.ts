import { UsersService } from '@app/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { VerifyDto } from './dtos/verify.dto';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async getVerify() {
    return this.usersService.findUnverifiedUsers();
  }

  async verifyUser(verifyDto: VerifyDto) {
    const user = await this.usersService.findOne(verifyDto.userId);
    if (user.verified) {
      throw new BadRequestException('User already verified');
    }

    if (verifyDto.accept) {
      return this.acceptUser(verifyDto.userId);
    } else {
      return this.rejectUser(verifyDto.userId);
    }
  }

  async rejectUser(userId: string) {
    const user = await this.usersService.remove(userId);
    return { user };
  }
  async acceptUser(userId: string) {
    const user = await this.usersService.update(userId, { verified: true });
    return { user };
  }
}
