import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { PushModule } from './push/push.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ScheduleModule } from './schedule/schedule.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    PushModule,
    AuthModule,
    RoomsModule,
    BookingsModule,
    FeedbackModule,
    ScheduleModule,
    DashboardModule,
  ],
})
export class AppModule {}
