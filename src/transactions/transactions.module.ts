import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { WalletModule } from '../wallet/wallet.module'; // Importe o WalletModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]), // Registra o TransactionRepository
    WalletModule, // Importa o WalletModule para acesso ao WalletRepository
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
