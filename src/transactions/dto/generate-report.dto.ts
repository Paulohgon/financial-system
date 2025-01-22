import { IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateReportDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date; 

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date; 

  @IsOptional()
  walletId?: number; 
  @IsOptional()
  category?: string; 
}
