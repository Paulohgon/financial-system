import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Wallet } from './wallet.entity';
  import { User } from './user.entity';
  
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'enum', enum: ['income', 'expense', 'transfer'] })
    type: 'income' | 'expense' | 'transfer';
  
    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;
  
    @Column({ nullable: true }) 
    category: string;
  
    @ManyToOne(() => Wallet, { nullable: true }) 
    sourceWallet: Wallet;
  
    @ManyToOne(() => Wallet, { nullable: true }) 
    targetWallet: Wallet;
  
    @ManyToOne(() => User, { eager: true }) 
    createdBy: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  