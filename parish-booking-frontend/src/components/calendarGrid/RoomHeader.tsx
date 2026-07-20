import type { RoomHeaderProps } from '../../interface/calendarGridInterface';

// Just a room name, styled. No logic — a pure leaf.
function RoomHeader({ emptyFirstCol, roomData, dense }: RoomHeaderProps) {
  return (
    <div id='header-container' className="flex border-b border-[var(--color-hairline)] shrink-0">
    {emptyFirstCol && (
      <div className="w-14 shrink-0" />
    )}
    <div className='flex-1 flex'>
      {roomData.map((room) => (
          <div key={room.id} className="flex-1 min-w-0 px-2 py-2 border-l border-[var(--color-hairline)]">
            <p className={`font-display truncate ${dense ? 'text-xs' : 'text-sm'}`}>{room.name}</p>
          </div>
        ))}
    </div>
    </div>
    
  );
}

export default RoomHeader;
