import { UsersService } from '@app/users/users.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async getVerify(): Promise<Omit<User, 'password'>[]> {
    return (await this.usersService.findUnverified()).map(
      ({ password: _password, ...profile }) => profile,
    );
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
