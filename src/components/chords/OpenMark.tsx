import React from 'react';
import { lineToNumber } from '../../utils/chordsUtils';

interface PropsType {
  line: number;
}

const OpenMark: React.FC<PropsType> = ({ line }) => {
  return (
    <circle
      cx={lineToNumber(line) * 20}
      cy={17}
      r="8"
      fill="white"
      stroke="black"
      strokeWidth="2"
    />
  );
};

export default OpenMark;
