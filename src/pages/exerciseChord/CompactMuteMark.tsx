import React from 'react';
import { lineToNumber } from '../../utils/chordsUtils';

interface PropsType {
  line: number;
}

const CompactMuteMark: React.FC<PropsType> = ({ line }) => {
  return (
    <>
      <line
        x1={lineToNumber(line) * 14 + 5} // 3 -> 5 (더 짧게)
        y1={9} // 8 -> 9 (더 짧게)
        x2={lineToNumber(line) * 14 + 15} // 17 -> 15 (더 짧게)
        y2={17} // 18 -> 17 (더 짧게)
        strokeWidth={1.2} // 1.5 -> 1.2 (더 얇게)
        stroke="black"
      />
      <line
        x1={lineToNumber(line) * 14 + 15} // 17 -> 15 (더 짧게)
        y1={9} // 8 -> 9 (더 짧게)
        x2={lineToNumber(line) * 14 + 5} // 3 -> 5 (더 짧게)
        y2={17} // 18 -> 17 (더 짧게)
        strokeWidth={1.2} // 1.5 -> 1.2 (더 얇게)
        stroke="black"
      />
    </>
  );
};

export default CompactMuteMark;
