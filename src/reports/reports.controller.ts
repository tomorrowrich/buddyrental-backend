import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { LoggedIn, Roles } from '@app/auth/auth.decorator';
import { AuthUserRole } from '@app/auth/role.enum';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Patch } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { Body } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
@ApiTags('Reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('categories')
  @LoggedIn()
  @ApiOperation({
    summary: 'Get list of report categories',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take for pagination',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip for pagination',
  })
  async getReportCategories(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const data = await this.reportsService.getReportCategories(
      +(take || 10),
      +(skip || 0),
    );
    return { success: true, data };
  }

  @Get()
  @LoggedIn()
  @Roles(AuthUserRole.ADMIN)
  @ApiOperation({
    summary:
      'Get report history with pagination, filtering by category and status',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take for pagination',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip for pagination',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'UUID of the category to filter reports',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'RESOLVED'],
    description: 'Status of reports to filter by',
  })
  async getReportHistory(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('category') categoryId?: string,
    @Query('status') status?: string,
  ) {
    if (categoryId && !isUUID(categoryId))
      throw new BadRequestException('Invalid category');
    const validStatus = this.reportsService.validateReportStatus(status);
    const response = await this.reportsService
      .getReportHistory({
        take: +(take || 10),
        skip: +(skip || 0),
        categoryId,
        status: validStatus,
      })
      .catch(() => {
        throw new InternalServerErrorException(
          'Failed to retrieve report history',
        );
      });

    return { success: true, ...response };
  }

  @Post()
  @LoggedIn()
  @ApiOperation({
    summary: 'Create a new report',
  })
  async createReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateReportDto,
  ) {
    console.log(body);
    const data = await this.reportsService.createReport(req.user.userId, body);
    return { success: true, data };
  }

  @Patch(':reportId')
  @LoggedIn()
  @Roles(AuthUserRole.ADMIN)
  @ApiOperation({
    summary: 'Update report status',
  })
  @ApiQuery({
    name: 'status',
    required: true,
    enum: ['PENDING', 'RESOLVED'],
    description: 'New status of the report',
  })
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Query('status') status: ReportStatus,
  ) {
    if (!isUUID(reportId)) throw new BadRequestException('Invalid report ID');
    if (!status) throw new BadRequestException('Missing status');
    this.reportsService.validateReportStatus(status);
    const data = await this.reportsService.updateReportStatus(reportId, status);
    return { success: true, data };
  }
}
