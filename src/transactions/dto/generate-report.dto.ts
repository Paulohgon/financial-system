import { IsNotEmpty, IsDate, IsOptional, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  walletId?: number;
  @IsOptional()
  category?: string; 
}
