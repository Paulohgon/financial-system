import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('users')  
  export class User {
    @PrimaryGeneratedColumn() 
    id: number;
  
    @Column({ unique: true }) 
    email: string;
  
    @Column() 
    name: string;
  
    @Column() 
    password: string;
  
    @Column({ default: 'user' }) 
    role: string;
  
    @CreateDateColumn() 
    createdAt: Date;
  
    @UpdateDateColumn() 
    updatedAt: Date;
  }
  