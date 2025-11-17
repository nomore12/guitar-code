import React from 'react';

interface StaffLineProps {
  y: number;
  staffIndex: number;
  startX: number;
  endX: number;
  barsPerStaff: number;
  barWidth: number;
}

const StaffLine: React.FC<StaffLineProps> = ({
  y,
  staffIndex,
  startX,
  endX,
  barsPerStaff,
  barWidth,
}) => {
  return (
    <g>
      {/* 시작 마디 번호 */}
      <text x={20} y={y + 4} fontSize={12}>
        {1 + staffIndex * barsPerStaff}
      </text>

      {/* 왼쪽 두 줄 (단순화된 시작 기호) */}
      {/* <line
        x1={startX - 14}
        y1={y - 16}
        x2={startX - 14}
        y2={y + 16}
        stroke="black"
        strokeWidth={2}
      />
      <line
        x1={startX - 9}
        y1={y - 16}
        x2={startX - 9}
        y2={y + 16}
        stroke="black"
        strokeWidth={2}
      /> */}

      {/* 리듬용 한 줄 보표 */}
      <line
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke="black"
        strokeWidth={1.5}
      />

      {/* 마디 구분선 */}
      {Array.from({ length: barsPerStaff + 1 }, (_, i) => {
        const x = startX + i * barWidth;
        return (
          <line
            key={i}
            x1={x}
            y1={y - 18}
            x2={x}
            y2={y + 18}
            stroke="black"
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
};

export default StaffLine;
