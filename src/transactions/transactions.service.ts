import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource, Between } from 'typeorm';
  import { Transaction } from '../entities/transaction.entity';
  import { Wallet } from '../entities/wallet.entity';
  import { CreateTransactionDto } from './dto/create-transaction.dto';
  import { User } from '../entities/user.entity';
  import { GenerateReportDto } from './dto/generate-report.dto';
  

  @Injectable()
  export class TransactionsService {
    constructor(
      @InjectRepository(Transaction)
      private readonly transactionRepository: Repository<Transaction>,
      @InjectRepository(Wallet)
      private readonly walletRepository: Repository<Wallet>,
      
      private readonly dataSource: DataSource,
    ) {}
    async findOne(id: number): Promise<Transaction> {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
        relations: ['sourceWallet', 'targetWallet', 'sourceWallet.user', 'targetWallet.user'],
      });
    
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
    
      return transaction;
    }
    async create(createTransactionDto: CreateTransactionDto, user: User): Promise<Transaction> {
      const { type, amount, sourceWalletId, targetWalletId, category } = createTransactionDto;
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        let sourceWallet: Wallet | null = null;
        let targetWallet: Wallet | null = null;
  
        if (sourceWalletId) {
          sourceWallet = await queryRunner.manager.findOne(Wallet, { where: { id: sourceWalletId } });
          if (!sourceWallet) {
            throw new NotFoundException(`Source wallet with ID ${sourceWalletId} not found`);
          }
          if (user.role !== 'admin' && sourceWallet.user.id != user.id) {
            throw new ForbiddenException('Access denied to source wallet');
          }
        }
        if (targetWalletId) {
          targetWallet = await queryRunner.manager.findOne(Wallet, { where: { id: targetWalletId } });
          if (!targetWallet) {
            throw new NotFoundException(`Target wallet with ID ${targetWalletId} not found`);
          }
          if (user.role !== 'admin' && targetWallet.user.id != user.id) {
            throw new ForbiddenException('Access denied to target wallet');
          }
        }
  
        if (type === 'income') {
          if (!targetWallet) {
            throw new BadRequestException('Target wallet is required for income');
          }
          const currentBalance = parseFloat(targetWallet.balance.toString()); // Converte para número
          targetWallet.balance = currentBalance + amount;
          await queryRunner.manager.save(Wallet, targetWallet);
          console.log("targetWallet.balance", targetWallet.balance);
          console.log("targetWallet.balance2", targetWallet.balance);
          console.log(targetWallet);
          console.log(targetWallet.balance);
        } else if (type === 'expense') {
          if (!sourceWallet) {
            throw new BadRequestException('Source wallet is required for expense');
          }
          if (sourceWallet.balance < amount) {
            throw new BadRequestException('Insufficient funds');
          }
          sourceWallet.balance -= amount;
          await queryRunner.manager.save(Wallet, sourceWallet);
        } else if (type === 'transfer') {
          if (!sourceWallet || !targetWallet) {
            throw new BadRequestException('Both source and target wallets are required for transfer');
          }
          if (sourceWallet.balance < amount) {
            throw new BadRequestException('Insufficient funds for transfer');
          }
          sourceWallet.balance -= amount;
          targetWallet.balance += amount;
          await queryRunner.manager.save(Wallet, sourceWallet);
          await queryRunner.manager.save(Wallet, targetWallet);
        }
  
        const transaction = this.transactionRepository.create({
          type,
          amount,
          category,
          sourceWallet,
          targetWallet,
          createdBy: user,
        });
        const savedTransaction = await queryRunner.manager.save(Transaction, transaction);
  
        await queryRunner.commitTransaction();
        return savedTransaction;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    async findAll(user: User): Promise<Transaction[]> {
      if (user.role === 'admin') {
        return this.transactionRepository.find({ relations: ['sourceWallet', 'targetWallet'] });
      }
      return this.transactionRepository.find({
        where: [
          { sourceWallet: { user: { id: user.id } } },
          { targetWallet: { user: { id: user.id } } },
        ],
        relations: ['sourceWallet', 'targetWallet'],
      });
    }
  
    async cancelTransaction(id: number, user: User): Promise<void> {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
        relations: ['sourceWallet', 'targetWallet', 'createdBy'],
      });
  
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
  
      if (user.role !== 'admin' && transaction.createdBy.id !== user.id) {
        throw new ForbiddenException('Access denied to cancel transaction');
      }
  
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // Reverte os saldos com base no tipo de transação
        if (transaction.type === 'income' && transaction.targetWallet) {
          transaction.targetWallet.balance -= transaction.amount;
          await queryRunner.manager.save(Wallet, transaction.targetWallet);
        } else if (transaction.type === 'expense' && transaction.sourceWallet) {
          transaction.sourceWallet.balance += transaction.amount;
          await queryRunner.manager.save(Wallet, transaction.sourceWallet);
        } else if (transaction.type === 'transfer' && transaction.sourceWallet && transaction.targetWallet) {
          transaction.sourceWallet.balance += transaction.amount;
          transaction.targetWallet.balance -= transaction.amount;
          await queryRunner.manager.save(Wallet, transaction.sourceWallet);
          await queryRunner.manager.save(Wallet, transaction.targetWallet);
        }
  
        await queryRunner.manager.remove(Transaction, transaction);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
    async generateReport(
        generateReportDto: GenerateReportDto,
        user: User,
      ): Promise<{ income: number; expense: number; total: number }> {
        const { startDate, endDate, walletId, category } = generateReportDto;
    
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
          let wallet: Wallet | null = null;
          if (walletId) {
            wallet = await queryRunner.manager.findOne(Wallet, {
              where: { id: walletId },
              relations: ['user'],
            });
    
            if (!wallet) {
              throw new NotFoundException(`Wallet with ID ${walletId} not found`);
            }
    
            if (user.role !== 'admin' && wallet.user.id !== user.id) {
              throw new NotFoundException(`You don't have access to this wallet`);
            }
          }
    
          const where = {
            createdAt: Between(startDate, endDate),
            ...(walletId ? { sourceWallet: { id: walletId } } : {}),
          };
    
          const transactions = await queryRunner.manager.find(Transaction, {
            where,
            relations: ['sourceWallet', 'targetWallet'],
          });
    
          const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
    
          const expense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
    
          const total = income - expense;
    
          await queryRunner.commitTransaction();
    
          return { income, expense, total };
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }
  }
  