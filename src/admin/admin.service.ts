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
      await this.usersService.verifyUser(verifyDto.userId);
      return { success: true, message: 'User verified' };
    } else {
      if (!verifyDto.reason) {
        throw new BadRequestException('Reason is required for rejection');
      }
      await this.usersService.rejectUser(verifyDto.userId, verifyDto.reason);
      return {
        success: true,
        reason: verifyDto.reason,
        message: 'User rejected',
      };
    }
  }
}
