import { IsEmail,MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  
  name: string;

  
  @MinLength(6)
  password: string;

  role?: string; // Opcional, pois o padrão será "user"
}
