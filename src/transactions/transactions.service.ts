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
  
    async findAll(user: User, startDate?: Date, endDate?: Date, walletId?: number): Promise<Transaction[]> {
      const whereConditions: any[] = [];
    
      if (user.role === 'admin') {
        // Admin tem acesso a todas as transações
        if (walletId) {
          whereConditions.push(
            { sourceWallet: { id: walletId }, createdAt: Between(startDate, endDate) },
            { targetWallet: { id: walletId }, createdAt: Between(startDate, endDate) }
          );
        } else if (startDate && endDate) {
          whereConditions.push({ createdAt: Between(startDate, endDate) });
        }
    
        return this.transactionRepository.find({
          where: whereConditions.length > 0 ? whereConditions : undefined,
          relations: ['sourceWallet', 'targetWallet'],
        });
      }
    
      // Usuário comum
      if (walletId) {
        whereConditions.push(
          { sourceWallet: { id: walletId, user: { id: user.id } }, createdAt: Between(startDate, endDate) },
          { targetWallet: { id: walletId, user: { id: user.id } }, createdAt: Between(startDate, endDate) }
        );
      } else if (startDate && endDate) {
        whereConditions.push(
          { sourceWallet: { user: { id: user.id } }, createdAt: Between(startDate, endDate) },
          { targetWallet: { user: { id: user.id } }, createdAt: Between(startDate, endDate) }
        );
      } else {
        whereConditions.push(
          { sourceWallet: { user: { id: user.id } } },
          { targetWallet: { user: { id: user.id } } }
        );
      }
    
      return this.transactionRepository.find({
        where: whereConditions,
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
    ): Promise<{ income: number; expense: number; transferIn: number; transferOut: number; total: number }> {
      const { startDate, endDate, walletId, category } = generateReportDto;
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    
      try {
        // Verifica se a carteira é válida e acessível, se fornecida
        if (walletId) {
          const wallet = await queryRunner.manager.findOne(Wallet, {
            where: { id: walletId },
            relations: ['user'],
          });
    
          if (!wallet) {
            throw new NotFoundException(`Wallet with ID ${walletId} not found`);
          }
    
          if (user.role !== 'admin' && wallet.user.id !== user.id) {
            throw new ForbiddenException(`You don't have access to this wallet`);
          }
        }
    
        const rawResults = await queryRunner.manager
          .createQueryBuilder(Transaction, 'transaction')
          .select('transaction.type', 'type')
          .addSelect('SUM(transaction.amount)', 'total')
          .leftJoin('transaction.sourceWallet', 'sourceWallet')
          .leftJoin('transaction.targetWallet', 'targetWallet')
          .where('transaction.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere(walletId ? '(sourceWallet.id = :walletId OR targetWallet.id = :walletId)' : '1=1', { walletId })
          .andWhere(category ? 'transaction.category = :category' : '1=1', { category })
          .groupBy('transaction.type')
          .getRawMany();

        let income = 0;
        let expense = 0;
        let transferIn = 0;
        let transferOut = 0;
    
        rawResults.forEach((row) => {
          const type = row.type;
          const total = parseFloat(row.total);
    
          if (type === 'income') {
            income += total;
          } else if (type === 'expense') {
            expense += total;
          } else if (type === 'transfer') {
            if (row['targetWalletId'] === walletId) {
              transferIn += total;
            } else if (row['sourceWalletId'] === walletId) {
              transferOut += total;
            }
          }
        });
    
        const total = income - expense + transferIn - transferOut;
    
        await queryRunner.commitTransaction();
    
        return { income, expense, transferIn, transferOut, total };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
    
    
  }
  