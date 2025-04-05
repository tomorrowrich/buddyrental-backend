import { LoggedIn } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Request, Response } from 'express';
import { PurchaseDto } from './dto/purchase.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @LoggedIn()
  @Post('purchase')
  purchase(@Req() req: AuthenticatedRequest, @Body() payload: PurchaseDto) {
    if (payload.type !== 'coin')
      throw new NotImplementedException(
        'Only coin purchases are currently supported.',
      );

    return this.paymentService.makePurchase(req.user.userId, payload);
  }

  @LoggedIn()
  @Post('withdraw')
  withdraw(@Req() req: AuthenticatedRequest, @Param('amount') amount: number) {
    throw new NotImplementedException({ amount });
    // const data = this.paymentService.makeWithdraw(req.user.userId, amount);
    // return { sucess: true, data };
  }

  @LoggedIn()
  @Get('history')
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async getHistory(
    @Req() req: AuthenticatedRequest,
    @Query('type') type: TransactionType,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    const { data, totalCount } = await this.paymentService.getTransactions(
      req.user.userId,
      type,
      +take || 10,
      +skip || 0,
    );

    return {
      success: true,
      data,
      totalCount,
      take: +take || 10,
      skip: +skip || 0,
    };
  }

  @Post('webhook')
  webhook(
    @Query('source') source: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    if (source === 'stripe') {
      return this.paymentService.handleStripeWebhook(req, res);
    }

    throw new BadRequestException('Invalid source.');
  }
}
