import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
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

  async register(registerDto: RegisterDto): Promise<string> {
    const check = await this.usersService.findUserWithEmail(registerDto.email);
    if (!check) {
      const { dateOfBirth, ...registerDto1 } = registerDto;
      const obj = new Date(dateOfBirth);
      const createUserDto = { ...registerDto1, dateOfBirth: obj };
      return (await this.usersService.create(createUserDto)).userId;
    } else {
      throw new ForbiddenException('Duplicate user');
    }
  }

  validateClientKey(clientKey: string): void {
    if (!clientKey) {
      throw new BadRequestException('No client key');
    }
    if (clientKey !== this.CLIENT_KEY) {
      throw new UnauthorizedException('Invalid client key');
    }
  }

  async signin(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const user = await this.usersService.findUserWithEmail(data.email);
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

  async verifyStatus(userId: string): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('No such user');
    }
    return user.verified;
  }
}
