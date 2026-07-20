import { useMemo } from 'react';
import type { Booking, Room } from '../lib/api';

// Shared day-calendar used by the admin Kalender page and the Monitor Display.
// Rooms are columns, hours run down the left rail, and the current time is drawn
// ONCE across all columns (Google-Calendar style) rather than per column.

const HOUR_PX = 56;

export interface ScheduleGridProps {
  rooms: Room[];
  bookings: Booking[];
  now: Date;
  dayStartHour?: number;
  dayEndHour?: number;
  /** Compact rendering for the wall-mounted monitor. */
  dense?: boolean;
}

export function ScheduleGrid({
  rooms,
  bookings,
  now,
  dayStartHour = 6,
  dayEndHour = 22,
  dense = false,
}: ScheduleGridProps) {
  const hourPx = dense ? 42 : HOUR_PX;
  const gridHeight = (dayEndHour - dayStartHour) * hourPx;
  const hourMarks = useMemo(
    () => Array.from({ length: dayEndHour - dayStartHour + 1 }, (_, i) => i + dayStartHour),
    [dayStartHour, dayEndHour],
  );

  const dayStart = new Date(now);
  dayStart.setHours(dayStartHour, 0, 0, 0);

  const minutesToPx = (min: number) => (min / 60) * hourPx;
  const clamp = (px: number) => Math.min(Math.max(px, 0), gridHeight);
  const offsetPx = (d: Date) =>
    clamp(minutesToPx(Math.max((d.getTime() - dayStart.getTime()) / 60000, 0)));

  const nowY = offsetPx(now);
  const byRoom = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const r of rooms) map.set(r.id, []);
    for (const b of bookings) {
      if (!map.has(b.roomId)) map.set(b.roomId, []);
      map.get(b.roomId)!.push(b);
    }
    return map;
  }, [rooms, bookings]);

  if (rooms.length === 0) {
    return <p className="p-8 text-center text-[var(--color-muted)]">Belum ada ruangan aktif.</p>;
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Header row — left spacer matches the hour rail so 00:00 lines up exactly */}
      <div className="flex border-b border-[var(--color-hairline)] shrink-0">
        <div className="w-14 shrink-0" />
        <div className="flex-1 flex">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="flex-1 min-w-0 px-2 py-2 border-l border-[var(--color-hairline)]"
            >
              <p className={`font-display truncate ${dense ? 'text-xs' : 'text-sm'}`}>{r.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex overflow-y-auto min-h-0">
        {/* Hour rail */}
        <div
          className="w-14 shrink-0 relative border-r border-[var(--color-hairline)]"
          style={{ height: gridHeight }}
        >
          {hourMarks.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 -translate-y-1/2 text-[10px] text-[var(--color-muted)] px-1"
              style={{ top: (h - dayStartHour) * hourPx }}
            >
              {String(h).padStart(2, '0')}.00
            </div>
          ))}
        </div>

        {/* Room columns share one relative wrapper so the now-line spans all of them */}
        <div className="flex-1 flex relative" style={{ height: gridHeight }}>
          {rooms.map((r) => (
            <div
              key={r.id}
              className="flex-1 min-w-0 border-l border-[var(--color-hairline)] relative"
            >
              {hourMarks.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-[var(--color-hairline)]"
                  style={{ top: (h - dayStartHour) * hourPx }}
                />
              ))}

              {(byRoom.get(r.id) ?? []).map((b) => {
                const top = offsetPx(new Date(b.startTime));
                const bottom = offsetPx(new Date(b.endTime));
                const height = Math.max(bottom - top, 18);
                const start = new Date(b.startTime);
                const end = new Date(b.endTime);
                const ongoing = start <= now && now < end;
                return (
                  <div
                    key={b.id}
                    className="absolute left-0.5 right-0.5 rounded-[2px] px-1.5 py-1 overflow-hidden border"
                    style={{
                      top,
                      height,
                      borderColor: ongoing ? 'var(--color-accent-2)' : 'var(--color-accent)',
                      background: ongoing
                        ? 'color-mix(in srgb, var(--color-accent-2) 10%, white)'
                        : 'color-mix(in srgb, var(--color-accent) 10%, white)',
                    }}
                  >
                    <p className="text-[11px] font-semibold truncate leading-tight">{b.purpose}</p>
                    <p className="text-[10px] text-[var(--color-muted)] truncate">
                      {fmtTime(b.startTime)}–{fmtTime(b.endTime)}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}

          {/* One shared current-time line */}
          <div
            className="absolute left-0 right-0 h-px z-10 pointer-events-none"
            style={{ top: nowY, background: 'var(--color-accent-2)' }}
          >
            <span
              className="absolute -left-1 -top-[3px] w-[7px] h-[7px] rounded-full"
              style={{ background: 'var(--color-accent-2)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
