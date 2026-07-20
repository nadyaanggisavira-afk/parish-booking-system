import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  // Railway's healthcheck target. Touches the DB so a deploy that can boot but
  // can't reach Postgres is reported unhealthy rather than silently serving 500s.
  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', at: new Date().toISOString() };
  }
}
