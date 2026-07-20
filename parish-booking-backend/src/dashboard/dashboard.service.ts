import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    // "Minggu ini" — bookings whose start falls in the current week (Mon–Sun).
    const now = new Date();
    const weekStart = new Date(now);
    const day = (weekStart.getDay() + 6) % 7; // 0 = Monday
    weekStart.setDate(weekStart.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [bookingsThisWeek, pendingCount, activeRooms, newReports, pending] = await Promise.all([
      this.prisma.booking.count({
        where: { startTime: { gte: weekStart, lt: weekEnd } },
      }),
      this.prisma.booking.count({ where: { status: 'pending' } }),
      this.prisma.room.count({ where: { isActive: true } }),
      this.prisma.feedback.count({ where: { type: 'violation_report', status: 'new' } }),
      this.prisma.booking.findMany({
        where: { status: 'pending' },
        include: { room: true, pemohon: { select: { nama: true, lingkungan: true } } },
        orderBy: { startTime: 'asc' },
        take: 8,
      }),
    ]);

    return {
      bookingsThisWeek,
      pendingCount,
      activeRooms,
      newReports,
      pending,
    };
  }
}
