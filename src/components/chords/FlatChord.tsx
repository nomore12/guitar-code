import React from 'react';

interface PropsType {
  flat: number;
  position: number;
}

const FlatChord: React.FC<PropsType> = ({ flat, position }) => {
  return (
    <text x={6} y={30 + (position - 1) * 30 + 22}>
      {flat}
    </text>
  );
};

export default FlatChord;
