import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyDto } from './dtos/verify.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/interfaces/api-paginated-response.decorator';
import { UserResponseDto } from '@app/users/dto/user-response.dto';
import { LoggedIn, Roles } from '@app/auth/auth.decorator';
import { AuthUserRole } from '@app/auth/role.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verify')
  @ApiBearerAuth()
  @LoggedIn()
  @Roles(AuthUserRole.ADMIN)
  @ApiPaginatedResponse(UserResponseDto)
  @ApiParam({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiParam({
    name: 'perPage',
    required: false,
    type: Number,
  })
  async getVerify(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
  ) {
    const resp = await this.adminService.getVerify(+page || 0, +perPage || 0);
    return resp;
  }

  @Post('verify')
  @ApiBearerAuth()
  @LoggedIn()
  @Roles(AuthUserRole.ADMIN)
  async postVerify(@Body() verifyDto: VerifyDto) {
    return await this.adminService.verifyUser(verifyDto);
  }
}
