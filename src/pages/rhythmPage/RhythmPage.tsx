import React from 'react';
import styled from 'styled-components';
import RhythmStaff from './RhythmStaff';
import { Bar } from './types';

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

  const sampleBars: Bar[] = [
    {
      beatsPerBar,
      events: [
        { start: 0, length: 1, kind: 'note' }, // 8th
        { start: 1, length: 1, kind: 'note' }, // 8th
        { start: 2, length: 1, kind: 'note' }, // 8th
        { start: 3, length: 1, kind: 'note' }, // 8th
        { start: 4, length: 1, kind: 'note' }, // 8th
        { start: 5, length: 1, kind: 'note' }, // 8th
        { start: 6, length: 1, kind: 'note' }, // 8th
        { start: 7, length: 1, kind: 'note' }, // 8th
        { start: 8, length: 1, kind: 'note' }, // 8th
        { start: 9, length: 1, kind: 'note' }, // 8th
        { start: 10, length: 1, kind: 'note' }, // 8th
        { start: 11, length: 1, kind: 'note' }, // 8th
        { start: 12, length: 1, kind: 'note' }, // 8th
        { start: 13, length: 1, kind: 'note' }, // 8th
        { start: 14, length: 1, kind: 'note' }, // 8th
        { start: 15, length: 1, kind: 'note' }, // 8th
      ],
      // events: [
      //   { start: 0, length: 2, kind: 'note' }, // 8th
      //   { start: 2, length: 1, kind: 'note' }, // 16th
      //   { start: 3, length: 1, kind: 'note' }, // 16th (완전한 1박)
      //   { start: 4, length: 2, kind: 'rest' }, // 8th rest
      //   { start: 6, length: 2, kind: 'note' }, // 8th (박 경계 직전)
      //   { start: 8, length: 1, kind: 'note' }, // 16th (다음 박으로 넘김)
      //   { start: 9, length: 1, kind: 'note' }, // 16th
      //   { start: 10, length: 2, kind: 'note' }, // 8th
      //   { start: 12, length: 4, kind: 'note' }, // quarter
      // ],
    },
    {
      beatsPerBar,
      events: [
        { start: 0, length: 3, kind: 'note', dots: 1 }, // dotted eighth
        { start: 3, length: 1, kind: 'note' }, // sixteenth
        { start: 4, length: 2, kind: 'note' }, // eighth
        { start: 6, length: 1, kind: 'rest' }, // sixteenth rest
        { start: 7, length: 1, kind: 'note' }, // sixteenth
        { start: 8, length: 2, kind: 'note' }, // eighth crossing beat
        { start: 10, length: 1, kind: 'note' }, // sixteenth
        { start: 11, length: 1, kind: 'note' }, // sixteenth
        { start: 12, length: 2, kind: 'rest' }, // eighth rest
        { start: 14, length: 2, kind: 'note' }, // eighth
      ],
    },
    {
      beatsPerBar,
      events: [
        { start: 0, length: 4, kind: 'rest' }, // quarter rest
        { start: 4, length: 2, kind: 'note' }, // eighth
        { start: 6, length: 2, kind: 'rest' }, // eighth rest
        { start: 8, length: 1, kind: 'note' }, // sixteenth
        { start: 9, length: 1, kind: 'rest' }, // sixteenth rest
        { start: 10, length: 1, kind: 'note' }, // sixteenth
        { start: 11, length: 1, kind: 'note' }, // sixteenth
        { start: 12, length: 4, kind: 'rest' }, // quarter rest
      ],
    },
  ];

  const totalBars = staffCount * barsPerStaff;
  const bars: Bar[] = Array.from(
    { length: totalBars },
    (_, i) => sampleBars[i % sampleBars.length],
  );

  const staffBarData: Bar[][] = Array.from(
    { length: staffCount },
    (_, staffIndex) =>
      bars.slice(staffIndex * barsPerStaff, (staffIndex + 1) * barsPerStaff),
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
            bars={staffBarData[staffIndex]}
          />
        ))}
      </svg>
    </RhythmPageContainer>
  );
};

export default RhythmPage;
