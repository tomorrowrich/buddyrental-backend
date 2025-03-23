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

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findExistingUser(
      registerDto.email,
      registerDto.citizenId,
      registerDto.phone,
    );
    if (existingUser) {
      throw new ForbiddenException('Duplicate user');
    }

    const createUserDto = {
      ...registerDto,
    };

    await this.usersService.create(createUserDto);
    return true;
  }

  private validateClientKey(clientKey: string): void {
    if (!clientKey) {
      throw new BadRequestException('No client key');
    }
    if (clientKey !== this.CLIENT_KEY) {
      throw new UnauthorizedException('Invalid client key');
    }
  }

  async login(data: {
    email: string;
    password: string;
    clientKey: string;
  }): Promise<{ accessToken: string }> {
    this.validateClientKey(data.clientKey);
    const user = await this.usersService.findUserWithEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.verified) {
      throw new UnauthorizedException('User is not verified');
    }

    const passwordMatch = await this.usersService.verifyPassword(
      user.userId,
      data.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.userId, email: user.email },
      { expiresIn: this.config.get<string>('auth.expiration_time') },
    );

    return { accessToken };
  }

  async me(userId: string) {
    const user = await this.usersService.findOne(userId).catch(() => null);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { user };
  }
}
