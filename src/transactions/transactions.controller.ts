import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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

  @Post('transfer')
  @LoggedIn()
  @ApiOperation({ summary: 'Transfer balance to a buddy' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async transfer(
    @Req() req: AuthenticatedRequest,
    @Body() body: { buddyId: string; amount: number },
  ) {
    const { buddyId, amount } = body;
    return await this.transactionsService.transferToBuddy(
      req.user.userId,
      buddyId,
      amount,
    );
  }

  @Get('me')
  @LoggedIn()
  @ApiOperation({ summary: 'Get my transaction history' })
  async getMyTransactions(@Req() req: AuthenticatedRequest) {
    return await this.transactionsService.getTransactionsByUser(
      req.user.userId,
    );
  }

  @Get('buddy/:buddyId')
  @LoggedIn()
  @ApiOperation({ summary: 'Get transactions for a buddy' })
  async getBuddyTransactions(@Param('buddyId') buddyId: string) {
    return await this.transactionsService.getTransactionsForBuddy(buddyId);
  }
}
