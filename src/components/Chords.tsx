import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import FingerMark from './chords/FingerMark';
import MuteMark from './chords/MuteMark';
import OpenMark from './chords/OpenMark';
import FlatChord from './chords/FlatChord';

interface PropsType {
  chord: {
    chord: string;
    fingers: number[][];
    mute: number[] | [];
    flat: number;
  };
}

const ContainerStyle = styled.div`
  display: flex;
  justify-content: center;
  border: 1px solid black;

  .chord-wrapper {
    border: 1px solid black;
    width: 180px;
    display: flex;
    justify-content: center;
    align-items: center;

    & > h1 {
      font-size: 4rem;
      font-weight: 700;
    }
  }
`;

const Chords: React.FC<PropsType> = ({ chord }) => {
  const rowCount = 4;
  const columnCount = 5;
  const cellSize = 20;
  const cellSizeY = 30;

  const [openFingers, setOpenFingers] = useState<number[]>([]);

  const lines: React.ReactNode[] = [];

  for (let i = 0; i <= rowCount; i++) {
    lines.push(
      <line
        key={`h${i}`}
        x1={cellSize}
        y1={(i + 1) * cellSizeY}
        x2={cellSize * (columnCount + 1)}
        y2={(i + 1) * cellSizeY}
        strokeWidth={i === 0 ? 4 : 1}
        stroke="black"
      />
    );
  }

  for (let i = 0; i <= columnCount; i++) {
    lines.push(
      <line
        key={`v${i}`}
        x1={(i + 1) * cellSize}
        y1={cellSizeY}
        x2={(i + 1) * cellSize}
        y2={cellSizeY * (rowCount + 1)}
        stroke="black"
      />
    );
  }

  useEffect(() => {
    const lines = chord.fingers.map((item) => item[0]);
    const resultLines = chord.mute ? lines.concat(chord.mute) : lines;
    const removeSet = new Set(resultLines);
    const resultArray = [1, 2, 3, 4, 5, 6].filter(
      (item) => !removeSet.has(item)
    );
    setOpenFingers([...resultArray]);
  }, [chord.fingers]);

  return (
    <ContainerStyle>
      <div className="chord-wrapper">
        <h1>{chord.chord}</h1>
      </div>
      <div>
        <svg
          width={cellSize * columnCount + cellSize * 2}
          height={cellSizeY * rowCount + cellSizeY * 2}
        >
          <FlatChord flat={chord.flat} position={chord.flat} />
          <FlatChord flat={chord.flat + 1} position={chord.flat + 1} />
          <FlatChord flat={chord.flat + 2} position={chord.flat + 2} />
          <FlatChord flat={chord.flat + 3} position={chord.flat + 3} />
          {lines}
          {chord.mute &&
            chord.mute.map((item, index) => {
              return <MuteMark key={`mute-${index}`} line={item} />;
            })}
          {openFingers &&
            openFingers.map((item, index) => {
              return <OpenMark key={`open-${index}`} line={item} />;
            })}
          {chord.fingers &&
            chord.fingers.map((item, index) => {
              return <FingerMark key={index} line={item[0]} flat={item[1]} />;
            })}
        </svg>
      </div>
    </ContainerStyle>
  );
};

export default Chords;
