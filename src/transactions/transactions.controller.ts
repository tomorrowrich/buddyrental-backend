import {
  Body,
  Controller,
  Patch,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { LoggedIn } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Patch('transfer')
  @LoggedIn()
  @ApiOperation({ summary: 'Transfer balance to a buddy' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async transfer(
    @Req() req: AuthenticatedRequest,
    @Body() body: { buddyId: string; amount: number; reservationId: string },
  ) {
    const { buddyId, amount, reservationId } = body;
    return await this.transactionsService.transferToBuddy(
      req.user.userId,
      buddyId,
      amount,
      reservationId,
    );
  }
}
