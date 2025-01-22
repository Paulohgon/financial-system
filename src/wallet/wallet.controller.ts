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
    
    @UseGuards(OwnershipGuard)
    @Get()
    findAll(@Request() req) {

      return this.walletService.findAll(req.user);
    }
    @UseGuards(OwnershipGuard)
    @Get(':walletId')
    findOne(@Param('walletId') walletId: number, @Request() req) {
      return this.walletService.findOne(+walletId);
    }
    @UseGuards(OwnershipGuard)
    @Patch(':walletId')
    update(
      @Param('walletId') walletId: number,
      @Body() updateWalletDto: UpdateWalletDto,
      @Request() req,
    ) {
      return this.walletService.update(walletId, updateWalletDto, req.user);
    }

    @UseGuards(OwnershipGuard)
    @Patch(':walletId/balance')
    updateBalance(
      @Param('walletId') walletId: number,
      @Query('amount') amount: number,
      @Request() req,
    ) {
      return this.walletService.updateBalance(walletId, +amount, req.user);
    }
    @UseGuards(OwnershipGuard)
    @Delete(':walletId')
    remove(@Param('walletId') walletId: number, @Request() req) {
      return this.walletService.remove(walletId, req.user);
    }
  }
  