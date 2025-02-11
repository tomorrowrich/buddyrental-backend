import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@app/users/users.service';

@Injectable()
export class AuthService {
  private readonly CLIENT_KEY: string;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    const temp = this.config.get<string>('client_key');

    if (!temp) {
      throw new Error('CLIENT_KEY is not defined in the environment variables');
    }

    this.CLIENT_KEY = temp;
  }

  async register(registerDto: RegisterDto): Promise<User> {
    if (await this.usersService.findUsersWithEmail(registerDto.email)) {
      throw new UnauthorizedException('Duplicate user');
    }
    const { dateOfBirth, ...registerDto1 } = registerDto;
    const obj = new Date(dateOfBirth);
    const createUserDto = { ...registerDto1, dateOfBirth: obj };
    return await this.usersService.create(createUserDto);
  }

  validateClientKey(clientKey: string): void {
    if (clientKey !== this.CLIENT_KEY) {
      throw new UnauthorizedException('Invalid client key');
    }
  }

  async signin(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user?.password !== data.password) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign(
      { sub: user.userId, email: user.email },
      { expiresIn: this.config.get<string | number>('auth.expiration_time') },
    );

    return { accessToken };
  }

  async verifyStatus(email: string): Promise<boolean> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.verified;
  }
}
