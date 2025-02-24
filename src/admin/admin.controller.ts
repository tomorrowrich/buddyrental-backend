import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyDto } from './dtos/verify.dto';
import { AuthGuard } from '@app/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/interfaces/api-paginated-response.decorator';
import { UserResponseDto } from '@app/users/dto/user-response.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verify')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiPaginatedResponse(UserResponseDto)
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
