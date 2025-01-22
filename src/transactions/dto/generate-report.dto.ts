import { IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateReportDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date; // Data inicial do relatório

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date; // Data final do relatório

  @IsOptional()
  walletId?: number; // Opcional: filtrar por carteira específica
  @IsOptional()
  category?: string; // Opcional: filtrar por categoria específica
}
