import { UsersService } from '@app/users/users.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async getVerify(): Promise<Omit<User, 'password'>[]> {
    return (await this.usersService.findUnverified()).map(
      ({ password, ...profile }) => profile,
    );
  }
}
