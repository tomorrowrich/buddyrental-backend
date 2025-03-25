import { Controller, Get, Query } from '@nestjs/common';
import { BuddiesService } from './buddies.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Buddies')
@Controller('buddies')
export class BuddiesController {
  constructor(private readonly buddiesService: BuddiesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getBuddies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10; // ✅ ตรวจสอบและแปลงเป็นตัวเลข

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new Error('Invalid pagination parameters'); // ✅ ตรวจสอบค่าที่ผิดพลาด
    }

    return this.buddiesService.getBuddies(pageNumber, limitNumber, sort);
  }

  @Get('search')
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchBuddies(
    @Query('query') query?: string,
    @Query('tags') tags?: string | string[], // ✅ รองรับทั้ง string และ array
    @Query('rating') rating?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const minRating = rating ? parseFloat(rating) : undefined;

    const parsedTags = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(',')
      : undefined;

    return this.buddiesService.searchBuddies(
      query,
      parsedTags,
      minRating,
      sort,
      pageNumber,
      limitNumber,
    );
  }
}
