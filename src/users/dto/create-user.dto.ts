import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    description: 'The age of the user',
    example: 30,
    type: Number,
  })
  age: number;

  @ApiProperty({
    enum: UserRole,
    description: 'The role of the user',
    example: UserRole.USER,
  })
  role: UserRole;
}
