import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  nama: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  noWhatsapp: string;

  @IsString()
  @MinLength(2)
  lingkungan: string;

  @IsString()
  @MinLength(8)
  password: string;
}
