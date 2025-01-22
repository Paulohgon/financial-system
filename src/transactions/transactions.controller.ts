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
  import { Role } from '../auth/roles.decorator';

  @UseGuards(JwtAuthGuard)
  @Controller('transactions')
  export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}
    

    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
      return this.transactionsService.create(createTransactionDto, req.user);
    }
    @Get(':id')
    @UseGuards(OwnershipGuard) 
    findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(+id);
  }
    @Get()
    @Role('admin')
    findAll(@Request() req) {
      return this.transactionsService.findAll(req.user);
    }
    
    @UseGuards(OwnershipGuard)
    @Delete(':id')
    cancel(@Param('id') id: number, @Request() req) {
      return this.transactionsService.cancelTransaction(id, req.user);
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
  