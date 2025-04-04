import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService extends Stripe implements OnModuleInit {
  constructor(private readonly config: ConfigService) {
    super(config.getOrThrow('stripe.secret_key'), {
      apiVersion: '2025-03-31.basil',
      typescript: true,
    });
  }

  async onModuleInit() {
    // Setup default default product for coins
    const defaultProduct = await this.products
      .retrieve('buddy-coins')
      .catch(() => null);

    if (!defaultProduct) {
      await this.products.create({
        name: 'Buddy Coins',
        description: 'Coins for BuddyRental',
        id: 'buddy-coins',
        default_price_data: {
          currency: 'thb',
          unit_amount: 100,
        },
      });
    }
  }
}
