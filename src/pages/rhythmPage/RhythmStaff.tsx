import React from 'react';
import { Bar } from './types';
import StaffLine from './StaffLine';
import RhythmLayer from './RhythmLayer';
import BeamLayer from './BeamLayer';
import { ActivePosition } from './useRhythmPlayback';

interface RhythmStaffProps {
  y: number;
  staffIndex: number;
  startX: number;
  endX: number;
  barsPerStaff: number;
  barWidth: number;
  bars: Bar[];
  startBarIndex: number;
  activePosition: ActivePosition | null;
}

const RhythmStaff: React.FC<RhythmStaffProps> = ({
  y,
  staffIndex,
  startX,
  endX,
  barsPerStaff,
  barWidth,
  bars,
  startBarIndex,
  activePosition,
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
        bars={bars}
        startBarIndex={startBarIndex}
        activePosition={activePosition}
      />
      <BeamLayer y={y} startX={startX} barWidth={barWidth} bars={bars} />
    </g>
  );
};

export default RhythmStaff;
