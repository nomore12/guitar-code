import React from 'react';

interface PropsType {
  flat: number;
  position: number;
}

const CompactFlatChord: React.FC<PropsType> = ({ flat, position }) => {
  return (
    <text
      x={4} // 6 -> 4
      y={20 + (position - 1) * 20 + 15} // 30 -> 20, 22 -> 15
      fontSize="10" // 기본값에서 작게
      fill="black"
    >
      {flat}
    </text>
  );
};

export default CompactFlatChord;
