import { PrismaService } from '@app/prisma/prisma.service';
import { StripeService } from '@app/stripe/stripe.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionType, TrasactionStatus } from '@prisma/client';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PurchaseDto } from './dto/purchase.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  async makePurchase(userId: string, payload: PurchaseDto) {
    if (payload.type !== 'coin')
      throw new NotImplementedException(
        'Only coin purchases are currently supported.',
      );

    if (payload.amount <= 100)
      throw new BadRequestException('Minimum purchase amount is 100 coins.');

    const amount = Math.ceil(payload.amount / 100) * 100;

    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new UnauthorizedException();

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: (user.firstName + ' ' + user.lastName).trim(),
        address: {
          city: user.city,
          country: user.country,
          postal_code: user.postalCode,
        },
        phone: user.phoneNumber,
      });

      customerId = customer.id;

      await this.prisma.user.update({
        where: { userId },
        data: { stripeCustomerId: customer.id },
      });
    }

    const coinPrice = await this.stripe.prices
      .search({
        query: 'product:"buddy-coins" AND active:"true"',
        expand: ['data.product'],
        limit: 1,
      })
      .then((res) => {
        if (res.data.length === 0) {
          throw new InternalServerErrorException('Coin price not found.');
        }
        return res.data[0].id;
      });

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: payload.redirectUrl + '?success=true',
      cancel_url: payload.redirectUrl + '?success=false',
      customer: customerId,
      line_items: [
        {
          price: coinPrice,
          quantity: amount,
        },
      ],
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.DEPOSIT,
        amount,
        paymentId: session.id,
        status: TrasactionStatus.PENDING,
        meta: {
          checkoutSession: JSON.stringify(session),
          stripeCustomerId: customerId,
          checkoutUrl: session.url,
        },
      },
    });

    return { success: true, data: { url: session.url, transaction } };
  }

  makeWithdraw(userId: string, amount: number) {
    throw new NotImplementedException({ userId, amount });
  }

  getHistory(userId: string, type?: string, take?: number, skip?: number) {
    throw new NotImplementedException({ userId, type, take, skip });
  }

  async handleStripeWebhook(req: RawBodyRequest<Request>, res: Response) {
    const webhookSecret = this.config.get<string | undefined>(
      'stripe.webhook_secret',
    );
    let event: Stripe.Event;

    if (webhookSecret) {
      try {
        event = this.stripe.webhooks.constructEvent(
          req.rawBody as Buffer,
          req.headers['stripe-signature'] as string,
          this.config.getOrThrow('stripe.webhook_secret'),
        );
      } catch (err) {
        throw new BadRequestException(`Webhook Error: ${err}`);
      }
    } else {
      event = req.body as Stripe.Event;
    }

    res.sendStatus(200);

    const session = event.data.object as Stripe.Checkout.Session;

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        if (session.payment_status !== 'paid') return;

        const transaction = await this.prisma.transaction.update({
          where: { paymentId: session.id, status: TrasactionStatus.PENDING },
          data: {
            status: TrasactionStatus.COMPLETED,
            meta: {
              checkoutSession: JSON.stringify(session),
              stripeCustomerId: session.customer as string,
            },
          },
        });

        if (!transaction || !transaction.userId) return;

        await this.prisma.user.update({
          where: { userId: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
        break;
      }
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        await this.prisma.transaction.update({
          where: {
            paymentId: session.id,
            status: TrasactionStatus.PENDING,
          },
          data: {
            status: TrasactionStatus.FAILED,
            meta: {},
          },
        });
        break;
      }
    }
  }
}
