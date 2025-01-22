import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from '../entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])], // Registra o WalletRepository
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule], // Exporta o WalletService e o WalletRepository
})
export class WalletModule {}
