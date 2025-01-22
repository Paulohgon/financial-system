import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateWalletDto {
  name: string;

  balance?: number; // Saldo inicial opcional
}
