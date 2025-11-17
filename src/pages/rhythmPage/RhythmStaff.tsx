import React from 'react';
import { RhythmEvent } from './types';
import StaffLine from './StaffLine';
import RhythmLayer from './RhythmLayer';

interface RhythmStaffProps {
  y: number;
  staffIndex: number;
  startX: number;
  endX: number;
  barsPerStaff: number;
  barWidth: number;
  beatsPerBar: number;
  bars: RhythmEvent[][];
}

const RhythmStaff: React.FC<RhythmStaffProps> = ({
  y,
  staffIndex,
  startX,
  endX,
  barsPerStaff,
  barWidth,
  beatsPerBar,
  bars,
}) => {
  return (
    <g>
      <StaffLine
        y={y}
        staffIndex={staffIndex}
        startX={startX}
        endX={endX}
        barsPerStaff={barsPerStaff}
        barWidth={barWidth}
      />
      <RhythmLayer
        y={y}
        startX={startX}
        barWidth={barWidth}
        beatsPerBar={beatsPerBar}
        bars={bars}
      />
    </g>
  );
};

export default RhythmStaff;
