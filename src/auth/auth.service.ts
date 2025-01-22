import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Reutilizando o serviço de usuários
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Valida o usuário baseado no email e senha
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); // Buscar pelo email
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user; // Remove a senha antes de retornar
      return result;
    }
    return null;
  }

  // Gera o token JWT
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
