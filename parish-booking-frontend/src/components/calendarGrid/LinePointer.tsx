
type topPosition = {topPosition: number};

function LinePointer({topPosition}: topPosition){
    const pointStyle = {top: topPosition, background:'var(--color-accent-2)'};
    const lineStyle = {background: 'var(--color-accent-2)'};
    
		return (
        <div
          className="absolute left-0 right-0 h-px z-10 pointer-events-none"
          style={pointStyle}
        >
            <span 
              className="absolute -left-1 -top-[3px] w-[7px] h-[7px] rounded-full"
              style={lineStyle}
            />
        </div>
    )
};

export default LinePointer;