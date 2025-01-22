import {
    IsNotEmpty,
    IsEnum,
    IsNumber,
    Min,
    IsOptional,
  } from 'class-validator';
  
  export class CreateTransactionDto {
    @IsEnum(['income', 'expense', 'transfer'])
    type: 'income' | 'expense' | 'transfer';
  
    @IsNotEmpty()
    @Min(0.01)
    @IsNumber()
    amount: number;
  
    @IsOptional()
    category?: string;
  
    @IsOptional()
    sourceWalletId?: number;
  
    @IsOptional()
    targetWalletId?: number;
  }
  