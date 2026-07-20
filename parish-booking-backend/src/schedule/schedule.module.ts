import { Module, forwardRef } from '@nestjs/common';
import { ScheduleGateway } from './schedule.gateway';
import { ScheduleController } from './schedule.controller';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [forwardRef(() => BookingsModule)],
  controllers: [ScheduleController],
  providers: [ScheduleGateway],
  exports: [ScheduleGateway],
})
export class ScheduleModule {}
