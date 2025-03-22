import {
  Controller,
  Patch,
  Body,
  Put,
  Req,
  ValidationPipe,
  Get,
  Post,
  Param,
} from '@nestjs/common';
import { BuddyService } from './buddy.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { LoggedIn, Roles } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { UpdateOfferedServicesDto } from './dto/update-offered-services.dto';
import { AuthUserRole } from '@app/auth/role.enum';
import { MakeBuddyDto } from './dto/make-buddy.dto';

@Controller('buddy')
export class BuddyController {
  constructor(private readonly buddyService: BuddyService) {}

  @Post()
  @LoggedIn()
  @Roles(AuthUserRole.USER)
  makeBuddy(
    @Req() req: AuthenticatedRequest,
    @Body() makeBuddyDto: MakeBuddyDto,
  ) {
    return this.buddyService.makeBuddy(req.user.userId, makeBuddyDto);
  }

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

  @Get('profile/:id')
  @LoggedIn()
  getProfile(@Param('id') buddyId: string) {
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
}
