import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { LoggedIn } from '@app/auth/auth.decorator';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @LoggedIn()
  getAllInterests() {
    return this.interestsService.getAllInterests();
  }

  @Post()
  @LoggedIn()
  createInterest(@Body() payload: CreateInterestDto) {
    return this.interestsService.createInterest(payload.name);
  }

  @Get('suggestions')
  @LoggedIn()
  getSuggestions() {
    return this.interestsService.getSuggestions();
  }

  @Get('search')
  @LoggedIn()
  searchRelatedInterests(@Query('query') query: string) {
    return this.interestsService.searchRelatedInterests(query);
  }
}
