import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {}  

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { walletId, transactionId } = request.params;

    if (walletId) {
      const wallet = await this.walletService.findOne(walletId);
      if (wallet.user.id !== user.id) {
        throw new ForbiddenException('You do not have access to this wallet');
      }
    }

    if (transactionId) {
      const transaction = await this.transactionsService.findOne(+transactionId);
      if (
        transaction.sourceWallet?.user.id !== user.id &&
        transaction.targetWallet?.user.id !== user.id
      ) {
        throw new ForbiddenException('You do not have access to this transaction');
      }
    }

    return true;
  }
}
