import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtém o papel esperado a partir do decorador @Roles()
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    if (!requiredRole) {
      return true; // Nenhum papel especificado, acesso permitido
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== requiredRole) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    return true; // Permite o acesso
  }
}
