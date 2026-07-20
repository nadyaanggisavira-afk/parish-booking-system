import type { Booking, Room } from '../../lib/api';

// A pure presentational booking card. It receives finished geometry (top/height
// already computed by the parent) and plain strings — it never touches Dates or
// the grid's time math, which is what keeps it reusable in any calendar.
export interface BookingBlockProps {
  title: string;
  subtitle: string;
  top: number;
  height: number;
  /** Currently in progress — draws in the accent-2 (live) colour. */
  ongoing: boolean;
}

// The faint horizontal lines marking each hour inside a column.
export interface HourLinesProps {
  hourMarks: number[];
  dayStartHour: number;
  hourPx: number;
}

// One room's column: the hour lines plus that room's booking cards.
// Geometry helpers are passed down from the parent rather than recomputed here.
export interface RoomColumnProps extends HourLinesProps {
  bookings: Booking[];
  now: Date;
  offsetPx: (d: Date) => number;
}

// A single column header (the room name above its column).
export interface RoomHeaderProps {
  emptyFirstCol?: boolean;
  roomData: Room[];
  dense: boolean;
}

// The current-time line drawn once across all columns.
export interface LinePointerProps {
  topPosition: number;
}

export interface ScheduleGridProps {
  rooms: Room[];
  bookings: Booking[];
  now: Date;
  dayStartHour?: number;
  dayEndHour?: number;
  /** Compact rendering for the wall-mounted monitor. */
  dense?: boolean;
  placeholder?:string;
}