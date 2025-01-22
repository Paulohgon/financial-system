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

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource, // DataSource para usar transações
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

      // Commita a transação se tudo estiver ok
      await queryRunner.commitTransaction();

      return savedWallet;
    } catch (error) {
      // Reverte a transação em caso de erro
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Fecha o queryRunner
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

      // Atualiza o saldo
      wallet.balance += amount;

      if (wallet.balance < 0) {
        throw new ConflictException('Insufficient funds');
      }

      const updatedWallet = await queryRunner.manager.save(Wallet, wallet);

      // Commita a transação
      await queryRunner.commitTransaction();

      return updatedWallet;
    } catch (error) {
      // Reverte a transação em caso de erro
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Fecha o queryRunner
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

      if (user.role !== 'admin' && wallet.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }

      // Remove a carteira
      await queryRunner.manager.remove(Wallet, wallet);

      // Commita a transação
      await queryRunner.commitTransaction();
    } catch (error) {
      // Reverte a transação em caso de erro
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Fecha o queryRunner
      await queryRunner.release();
    }
  }
  async findOne(id: number, user: User): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id },
        relations: ['user'], // Inclui o relacionamento com o usuário
      });
  
      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }
  
      // Verifica se o usuário tem permissão para acessar a carteira
      if (wallet.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
  
      await queryRunner.commitTransaction(); // Confirma a transação
      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Reverte a transação em caso de erro
      throw error;
    } finally {
      await queryRunner.release(); // Libera o queryRunner
    }
  }
  
  async findAll(user: User): Promise<Wallet[]> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      let wallets: Wallet[];
  
      if (user.role === 'admin') {
        // Admin pode acessar todas as carteiras
        wallets = await queryRunner.manager.find(Wallet);
      } else {
        // Usuário comum só pode acessar suas próprias carteiras
        wallets = await queryRunner.manager.find(Wallet, {
          where: { user: { id: user.id } },
        });
      }
  
      await queryRunner.commitTransaction(); // Confirma a transação
      return wallets;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Reverte a transação em caso de erro
      throw error;
    } finally {
      await queryRunner.release(); // Libera o queryRunner
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
  
      // Verifica se o usuário tem permissão para atualizar a carteira
      if (user.role !== 'admin' && wallet.user.id !== user.id) {
        throw new ForbiddenException('Access denied');
      }
  
      // Atualiza os campos enviados
      Object.assign(wallet, updateWalletDto);
  
      const updatedWallet = await queryRunner.manager.save(Wallet, wallet);
  
      await queryRunner.commitTransaction(); // Confirma a transação
      return updatedWallet;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Reverte a transação em caso de erro
      throw error;
    } finally {
      await queryRunner.release(); // Libera o queryRunner
    }
  }
  
}
