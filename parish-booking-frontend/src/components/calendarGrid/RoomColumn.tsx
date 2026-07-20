import type { RoomColumnProps } from '../../interface/calendarGridInterface';
import { fmtTimeStamp } from '../../utils/formatTimeHelper';
import { MinBookingHeightPx } from '../../constant/calendarGridConstant';
import HourLines from './HourLines';
import BookingBlock from './BookingBlock';

// One room's column: hour lines + that room's booking cards. Composes two atoms
// rather than being an atom itself — it still knows about Dates and Bookings,
// but leaves all pixel math to the offsetPx helper handed down from ScheduleGrid
// (the single source of truth for "where is midnight" / "how tall is an hour").
function RoomColumn({ bookings, now, offsetPx, hourMarks, dayStartHour, hourPx }: RoomColumnProps) {
  return (
    <div className="flex-1 min-w-0 border-l border-[var(--color-hairline)] relative">
      <HourLines hourMarks={hourMarks} dayStartHour={dayStartHour} hourPx={hourPx} />

      {bookings.map((b) => {
        const top = offsetPx(new Date(b.startTime));
        const bottom = offsetPx(new Date(b.endTime));
        const height = Math.max(bottom - top, MinBookingHeightPx);
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const ongoing = start <= now && now < end;
        return (
          <BookingBlock
            key={b.id}
            title={b.purpose}
            subtitle={`${fmtTimeStamp(b.startTime, 'id-ID')}–${fmtTimeStamp(b.endTime, 'id-ID')}`}
            top={top}
            height={height}
            ongoing={ongoing}
          />
        );
      })}
    </div>
  );
}

export default RoomColumn;
