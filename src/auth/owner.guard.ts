import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletService: WalletService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const { walletId, id } = request.params;

    if (walletId) {
      const wallet = await this.walletService.findOne(walletId, user);
      if (wallet.user.id !== user.userId) {
        throw new ForbiddenException('You do not have access to this wallet');
      }
    }

    if (id) {
      const transaction = await this.transactionsService.findOne(id);
      if (
        transaction.sourceWallet.user.id !== user.userId &&
        transaction.targetWallet.user.id !== user.userId
      ) {
        throw new ForbiddenException('You do not have access to this transaction');
      }
    }

    return true;
  }
}
