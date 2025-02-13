import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyDto } from './dtos/verify.dto';
import { AuthGuard } from '@app/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  getVerify() {
    return this.adminService.getVerify();
  }

  @Post('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async postVerify(@Body() verifyDto: VerifyDto) {
    return await this.adminService.verifyUser(verifyDto);
  }
}
