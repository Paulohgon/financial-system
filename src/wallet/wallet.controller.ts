import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    Query,
  } from '@nestjs/common';
  import { WalletService } from './wallet.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { CreateWalletDto } from './dto/create-wallet.dto';
  import { UpdateWalletDto } from './dto/update-wallet.dto';
  import { OwnershipGuard } from '../auth/owner.guard';
  @UseGuards(JwtAuthGuard)
  @Controller('wallets')
  export class WalletController {
    constructor(private readonly walletService: WalletService) {}
    
    @Post()
    create(@Body() createWalletDto: CreateWalletDto, @Request() req) {
      return this.walletService.create(createWalletDto, req.user);
    }
    
    @UseGuards(OwnershipGuard) // Apenas o proprietário pode acessar
    @Get()
    findAll(@Request() req) {
      return this.walletService.findAll(req.user);
    }
    @UseGuards(OwnershipGuard)
    @Get(':id')
    findOne(@Param('id') id: number, @Request() req) {
      return this.walletService.findOne(id, req.user);
    }
    @UseGuards(OwnershipGuard)
    @Patch(':id')
    update(
      @Param('id') id: number,
      @Body() updateWalletDto: UpdateWalletDto,
      @Request() req,
    ) {
      return this.walletService.update(id, updateWalletDto, req.user);
    }
    @UseGuards(OwnershipGuard)
    @Patch(':id/balance')
    updateBalance(
      @Param('id') id: number,
      @Query('amount') amount: number,
      @Request() req,
    ) {
      return this.walletService.updateBalance(id, +amount, req.user);
    }
    @UseGuards(OwnershipGuard)
    @Delete(':id')
    remove(@Param('id') id: number, @Request() req) {
      return this.walletService.remove(id, req.user);
    }
  }
  