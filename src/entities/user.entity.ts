import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('users') // Nome da tabela no banco de dados
  export class User {
    @PrimaryGeneratedColumn() // Chave primária auto-incrementada
    id: number;
  
    @Column({ unique: true }) // Coluna única para e-mail
    email: string;
  
    @Column() // Coluna para o nome do usuário
    name: string;
  
    @Column() // Coluna para senha (será armazenada como hash)
    password: string;
  
    @Column({ default: 'user' }) // Papel do usuário (ex.: user, admin)
    role: string;
  
    @CreateDateColumn() // Data de criação (preenchida automaticamente pelo TypeORM)
    createdAt: Date;
  
    @UpdateDateColumn() // Data de última atualização (preenchida automaticamente pelo TypeORM)
    updatedAt: Date;
  }
  