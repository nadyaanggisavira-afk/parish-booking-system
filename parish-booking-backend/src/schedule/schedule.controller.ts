import { Controller, Get, Inject, forwardRef } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';

@Controller('schedule')
export class ScheduleController {
  constructor(
    @Inject(forwardRef(() => BookingsService))
    private bookingsService: BookingsService,
  ) {}

  // Public, read-only. Powers the monitor outside the secretariat.
  // The gateway pushes a "schedule:changed" event whenever this data
  // changes, so the display re-fetches this instead of polling blindly.
  @Get('today')
  getTodaysSchedule() {
    return this.bookingsService.findTodaysApprovedSchedule();
  }
}
