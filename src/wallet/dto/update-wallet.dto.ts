import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateWalletDto {
  name?: string;
  balance?: number;
}
