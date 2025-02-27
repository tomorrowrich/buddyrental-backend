import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '@app/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [UsersModule, JwtModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
