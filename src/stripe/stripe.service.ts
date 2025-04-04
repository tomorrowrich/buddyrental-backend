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

  async onModuleInit() {}
}
