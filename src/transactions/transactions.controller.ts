import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    Query,
  } from '@nestjs/common';
  import { TransactionsService } from './transactions.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { OwnershipGuard } from '../auth/owner.guard';
  import { CreateTransactionDto } from './dto/create-transaction.dto';
  import { GenerateReportDto } from './dto/generate-report.dto';

  @UseGuards(JwtAuthGuard)
  @Controller('transactions')
  export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}
    
    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
      return this.transactionsService.create(createTransactionDto, req.user);
    }
    @Get('/find/:transactiontransactionId')
    @UseGuards(OwnershipGuard) 
    findOne(@Param('transactionId') transactionId: number, @Request() req) {
    return this.transactionsService.findOne(transactionId);
  }
    @Get()
    findAll(
      @Request() req,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
      @Query('walletId') walletId?: number
    ) {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      const wallet = walletId ? parseInt(walletId as unknown as string, 10) : undefined;
  
      return this.transactionsService.findAll(req.user, start, end, wallet);
    }
    
    @UseGuards(OwnershipGuard)
    @Delete(':transactionId')
    cancel(@Param('transactionId') transactionId: number, @Request() req) {
      return this.transactionsService.cancelTransaction(transactionId, req.user);
    }
    @UseGuards(OwnershipGuard)
    @Get('report')
    async generateReport(
      @Query() generateReportDto: GenerateReportDto,
      @Request() req,
    ) {
      return this.transactionsService.generateReport(generateReportDto, req.user);
    }
  }
  