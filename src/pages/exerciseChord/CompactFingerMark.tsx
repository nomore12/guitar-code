import React from 'react';
import { lineToNumber } from '../../utils/chordsUtils';

interface PropsType {
  line: number;
  flat: number;
}

const CompactFingerMark: React.FC<PropsType> = ({ line, flat }) => {
  return (
    <circle
      cx={lineToNumber(line) * 14 + 10} // 20 -> 14
      cy={10 + flat * 20} // 15 -> 10, 30 -> 20
      r="5" // 8 -> 5
      fill="black"
    />
  );
};

export default CompactFingerMark;
