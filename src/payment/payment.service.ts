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
      ui_mode: 'embedded',
      mode: 'payment',
      return_url: payload.redirectUrl + '?success=true',
      // cancel_url: payload.redirectUrl + '?success=false',
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
          // checkoutUrl: session.url,
        },
      },
      omit: { meta: true },
    });

    return {
      success: true,
      data: { clientSecret: session.client_secret, transaction },
    };
  }

  async makeWithdraw(userId: string, amount: number) {
    const user = await this.prisma.user.findFirst({
      where: { userId },
      include: { buddy: true },
    });

    if (!user) throw new UnauthorizedException('Buddy not found.');

    const buddy = user.buddy;

    if (!buddy) throw new BadRequestException('Buddy not found.');

    if (!buddy.stripeAccountId)
      throw new BadRequestException('Buddy not onboarded.');

    if (buddy.balanceWithdrawable < amount) {
      throw new BadRequestException(
        'Insufficient balance. Please check your balance.',
      );
    }

    const transfer = await this.stripe.transfers.create({
      amount: amount,
      currency: 'thb',
      destination: buddy.stripeAccountId,
      transfer_group: `buddy-${userId}`,
    });

    const transaction = await this.prisma.transaction
      .create({
        data: {
          userId,
          type: TransactionType.WITHDRAWAL,
          amount: +amount,
          paymentId: transfer.id,
          status: TrasactionStatus.PENDING,
          meta: {
            stripeTransferId: transfer.id,
            stripeAccountId: buddy.stripeAccountId,
          },
        },
        omit: { meta: true },
      })
      .then(async (transaction) => {
        await this.prisma.buddy.update({
          where: { buddyId: buddy.buddyId },
          data: {
            balanceWithdrawable: { decrement: +amount },
          },
        });
        return transaction;
      });

    if (!transaction) {
      throw new InternalServerErrorException('Transaction failed.');
    }

    return transaction;
  }

  async getTransactions(userId: string, type?: string, take = 10, skip = 0) {
    const data = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...(type && { type: type as TransactionType }),
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      omit: { meta: true },
    });

    return { data, totalCount: data.length };
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

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;

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
        const session = event.data.object;

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
      case 'transfer.created': {
        const transfer = event.data.object;

        const transaction = await this.prisma.transaction.findFirst({
          where: {
            paymentId: transfer.id,
            status: TrasactionStatus.PENDING,
          },
        });

        if (!transaction) return;

        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TrasactionStatus.COMPLETED,
            meta: {
              stripeTransferId: transfer.id,
              stripeAccountId: transfer.destination as string,
            },
          },
        });
        break;
      }
    }
  }

  async onboardBuddy(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: { buddy: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.buddy?.stripeAccountId) {
      throw new BadRequestException('Buddy already onboarded.');
    }

    const stripeAccount = await this.stripe.accounts
      .create({
        country: user.country,
        email: user.email,
        business_type: 'individual',
      })
      .then(async (account) => {
        const acctLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: this.config.get('site_url') + 'profile',
          return_url: this.config.get('site_url'),
          type: 'account_onboarding',
        });

        return { url: acctLink.url, stripeAccountId: account.id };
      });

    return stripeAccount;
  }
}
