import type { BookingBlockProps } from '../../interface/calendarGridInterface';

// One booking card. Deliberately dumb: top/height arrive pre-computed, so this
// component has zero knowledge of Dates, hours, or the grid's time math — that's
// what makes it reusable outside ScheduleGrid too.
function BookingBlock({ title, subtitle, top, height, ongoing }: BookingBlockProps) {
  return (
    <div
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
      <p className="text-[11px] font-semibold truncate leading-tight">{title}</p>
      <p className="text-[10px] text-[var(--color-muted)] truncate">{subtitle}</p>
    </div>
  );
}

export default BookingBlock;
