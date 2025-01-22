import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '../entities/user.entity';
  
  @Entity('wallets')
  export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    balance: number;
  
    @ManyToOne(() => User, (user) => user.id, { eager: true }) // Relacionamento com o usuário
    user: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  