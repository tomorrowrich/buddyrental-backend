import { Controller, Patch, Param, Body } from '@nestjs/common';
import { BuddyService } from './buddy.service';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Controller('buddy')
export class BuddyController {
  constructor(private readonly buddyService: BuddyService) {}

  @Patch(':id/pricing')
  updatePricing(
    @Param('id') buddyId: string,
    @Body() updatePricingDto: UpdatePricingDto,
  ) {
    return this.buddyService.updatePricing(
      buddyId,
      updatePricingDto.minPrice,
      updatePricingDto.maxPrice,
    );
  }
}
