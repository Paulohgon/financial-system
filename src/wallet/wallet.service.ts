import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Transaction } from 'src/entities/transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createWalletDto: CreateWalletDto, user: User): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = this.walletRepository.create({
        ...createWalletDto,
        user,
      });

      const savedWallet = await queryRunner.manager.save(Wallet, wallet);

      await queryRunner.commitTransaction();

      return savedWallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateBalance(
    walletId: number,
    amount: number,
    user: User,
  ): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId },
        relations: ['user'],
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }

      if (user.role !== 'admin' && wallet.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
      const currentBalance = parseFloat(wallet.balance.toString()); // Converte para número
      wallet.balance = currentBalance + amount;

      if (wallet.balance < 0) {
        throw new ConflictException('Insufficient funds');
      }

      const updatedWallet = await queryRunner.manager.save(Wallet, wallet);

      await queryRunner.commitTransaction();

      return updatedWallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id },
        relations: ['user'],
      });
  
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
  
      // Verifica se o usuário tem permissão para excluir a carteira
      if (user.role !== 'admin' && wallet.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
  
      // Exclui todas as transações associadas à carteira
      await queryRunner.manager.delete(Transaction, { sourceWallet: { id } });
      await queryRunner.manager.delete(Transaction, { targetWallet: { id } });
  
      // Exclui a carteira
      await queryRunner.manager.remove(Wallet, wallet);
  
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async findOne(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    
    return wallet;
  }

  
  async findAll(user: User): Promise<Wallet[]> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      let wallets: Wallet[];
  
      if (user.role === 'admin') {
        wallets = await queryRunner.manager.find(Wallet);
      } else {
        wallets = await queryRunner.manager.find(Wallet, {
          where: { user: { id: user.id } },
        });
      }
  
      await queryRunner.commitTransaction();
      return wallets;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async update(
    id: number,
    updateWalletDto: UpdateWalletDto,
    user: User,
  ): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id },
        relations: ['user'],
      });
  
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
  
      if (user.role !== 'admin' && wallet.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
  
      Object.assign(wallet, updateWalletDto);
  
      const updatedWallet = await queryRunner.manager.save(Wallet, wallet);
  
      await queryRunner.commitTransaction();
      return updatedWallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
}
