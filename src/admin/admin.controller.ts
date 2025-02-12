import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyDto } from './dtos/verify.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verify')
  getVerify() {
    return this.adminService.getVerify();
  }

  @Post('verify')
  async postVerify(@Body() verifyDto: VerifyDto) {
    return await this.adminService.verifyUser(verifyDto);
  }
}
