import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { LoggedIn } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @LoggedIn()
  getAllInterests(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
  ) {
    return this.interestsService.getAllInterests(+page || 0, +perPage || 0);
  }

  @Get('me')
  @LoggedIn()
  getMyInterests(@Req() req: AuthenticatedRequest) {
    return this.interestsService.getMyInterests(req.user.userId);
  }

  @Post()
  @LoggedIn()
  createInterest(@Body() payload: CreateInterestDto) {
    return this.interestsService.createInterest(payload.name);
  }

  @Get('suggestions')
  @LoggedIn()
  getSuggestions(@Query('take') take: string) {
    return this.interestsService.getSuggestions(+take);
  }

  @Get('search')
  @LoggedIn()
  searchRelatedInterests(@Query('query') query: string) {
    return this.interestsService.searchRelatedInterests(query);
  }
}
