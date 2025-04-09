import {
  Controller,
  Patch,
  Body,
  Put,
  Req,
  ValidationPipe,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { BuddyService } from './buddy.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { LoggedIn, Roles } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UpdateOfferedServicesDto } from './dto/update-offered-services.dto';
import { AuthUserRole } from '@app/auth/role.enum';
import { CreateBuddyDto } from './dto/create-buddy.dto';

@Controller('buddy')
export class BuddyController {
  constructor(private readonly buddyService: BuddyService) {}

  @Patch('pricing')
  @LoggedIn()
  @Roles(AuthUserRole.BUDDY)
  updatePricing(
    @Req() req: AuthenticatedRequest,
    @Body() updatePricingDto: UpdatePricingDto,
  ) {
    return this.buddyService.updatePricing(
      req.user.buddyId!,
      updatePricingDto.minPrice,
      updatePricingDto.maxPrice,
    );
  }

  @Get('profile/:buddyId')
  @LoggedIn()
  getProfile(@Param('buddyId') buddyId: string) {
    return this.buddyService.getBuddyProfile(buddyId);
  }

  @Put('offered-services')
  @LoggedIn()
  @Roles(AuthUserRole.BUDDY)
  async updateOfferedServices(
    @Req() req: AuthenticatedRequest,
    @Body() payload: UpdateOfferedServicesDto,
  ) {
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(payload, { type: 'body' });
    return await this.buddyService.updateOfferedServices(
      req.user.buddyId!,
      payload.services,
    );
  }

  @Post()
  @LoggedIn()
  @Roles(AuthUserRole.USER)
  async createBuddy(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateBuddyDto,
  ) {
    const validationPipe = new ValidationPipe({ transform: true });
    await validationPipe.transform(payload, { type: 'body' });
    return await this.buddyService.createBuddy(req.user.userId, payload);
  }
}
