import React from 'react';
import styled from 'styled-components';
import RhythmStaff from './RhythmStaff';
import { RhythmEvent } from './types';

const RhythmPageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 24px 0;

  .score-svg {
    width: 1200px;
    max-width: 100%;
  }
`;

const RhythmPage: React.FC = () => {
  const width = 1200;
  const height = 480;

  const marginLeft = 80;
  const marginRight = 40;
  const marginTop = 50;

  const staffCount = 4; // 기본 4줄
  const staffSpacing = 120;

  const beatsPerBar = 4;
  const barsPerStaff = 4;
  const createQuarterNoteBar = (): RhythmEvent[] =>
    Array.from({ length: beatsPerBar }, (_, beatIndex) => ({
      start: beatIndex * 4,
      length: 4,
      kind: 'note' as const,
    }));

  const staffBarData: RhythmEvent[][][] = Array.from(
    { length: staffCount },
    () => Array.from({ length: barsPerStaff }, () => createQuarterNoteBar()),
  );

  const innerWidth = width - marginLeft - marginRight;
  const barWidth = innerWidth / barsPerStaff;

  const staffYPositions = Array.from(
    { length: staffCount },
    (_, i) => marginTop + i * staffSpacing,
  );

  return (
    <RhythmPageContainer>
      <svg
        className="score-svg"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 템포 표시 */}
        <text x={marginLeft} y={16} fontSize={16} fontWeight="bold">
          ♩ = 60
        </text>

        {/* 4/4 박자 표시 (첫 줄 왼쪽) */}
        <text
          x={marginLeft - 30}
          y={staffYPositions[0] + 18}
          fontSize={20}
          fontWeight="bold"
        >
          {beatsPerBar}
        </text>
        <line
          x1={marginLeft - 30}
          y1={staffYPositions[0] + 20}
          x2={marginLeft - 16}
          y2={staffYPositions[0] + 20}
          stroke="black"
          strokeWidth={2}
        />
        <text
          x={marginLeft - 30}
          y={staffYPositions[0] + 38}
          fontSize={20}
          fontWeight="bold"
        >
          4
        </text>

        {staffYPositions.map((y, staffIndex) => (
          <RhythmStaff
            key={staffIndex}
            y={y + 20}
            staffIndex={staffIndex}
            startX={marginLeft}
            endX={width - marginRight}
            barsPerStaff={barsPerStaff}
            barWidth={barWidth}
            beatsPerBar={beatsPerBar}
            bars={staffBarData[staffIndex]}
          />
        ))}
      </svg>
    </RhythmPageContainer>
  );
};

export default RhythmPage;
