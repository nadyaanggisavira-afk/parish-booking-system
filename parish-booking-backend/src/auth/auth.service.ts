import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Umat self-registration. Always creates a `umat` role; admin accounts are
  // provisioned via the seed, never through this endpoint.
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        nama: dto.nama,
        email: dto.email,
        noWhatsapp: dto.noWhatsapp,
        lingkungan: dto.lingkungan,
        passwordHash,
        role: 'umat',
      },
    });
    return this.tokenFor(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Same error for "no such user" and "wrong password" — don't leak which failed.
    if (!user) throw new UnauthorizedException('Email atau kata sandi salah');

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException('Email atau kata sandi salah');

    return this.tokenFor(user);
  }

  private async tokenFor(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        noWhatsapp: user.noWhatsapp,
        lingkungan: user.lingkungan,
        role: user.role,
      },
    };
  }
}
