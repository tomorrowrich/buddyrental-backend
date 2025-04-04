import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { PurchaseDto } from './dto/purchase.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { StripeService } from '@app/stripe/stripe.service';
import { TransactionType, TrasactionStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
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

  handleStripeWebhook(payload: any) {
    // Handle Stripe webhook logic here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    throw new NotImplementedException({ payload });
  }
}
