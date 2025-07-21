import React from 'react';
import { lineToNumber } from '../../utils/chordsUtils';

interface PropsType {
  line: number;
}

const CompactOpenMark: React.FC<PropsType> = ({ line }) => {
  return (
    <circle
      cx={lineToNumber(line) * 14 + 10} // 20 -> 14
      cy={13} // 17 -> 13
      r="5" // 8 -> 5
      fill="white"
      stroke="black"
      strokeWidth="1.5" // 2 -> 1.5
    />
  );
};

export default CompactOpenMark;
