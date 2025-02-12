import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyDto, VerifyMethod } from './dtos/verify.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verify')
  getVerify() {
    return this.adminService.getVerify();
  }

  @Post('verify')
  postVerify(@Body() verifyDto: VerifyDto) {
    if (verifyDto.method == VerifyMethod.ACCEPT) {
      return this.adminService.acceptUser(verifyDto.userId);
    }

    if (verifyDto.method == VerifyMethod.REJECT) {
      return this.adminService.rejectUser(verifyDto.userId);
    }
  }
}
