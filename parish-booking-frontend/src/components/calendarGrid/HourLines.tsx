import type { HourLinesProps } from '../../interface/calendarGridInterface';

// The faint horizontal rule at each hour mark inside a column. Pure — just maps
// numbers to positioned divs.
function HourLines({ hourMarks, dayStartHour, hourPx }: HourLinesProps) {
  return (
    <>
      {hourMarks.map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-[var(--color-hairline)]"
          style={{ top: (h - dayStartHour) * hourPx }}
        />
      ))}
    </>
  );
}

export default HourLines;
