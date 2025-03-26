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

@Controller('reports')
@ApiTags('Reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
    const response = await this.reportsService
      .getReportHistory({
        take: +(take || 10),
        skip: +(skip || 0),
        categoryId,
        status: status as ReportStatus,
      })
      .catch(() => {
        throw new InternalServerErrorException(
          'Failed to retrieve report history',
        );
      });

    return { success: true, ...response };
  }
}
