import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import FingerMark from './FingerMark';
import MuteMark from './MuteMark';
import OpenMark from './OpenMark';
import FlatChord from './FlatChord';

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
      font-size: 3rem;
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

  // 실제 운지된 프렛의 최소값과 최대값 찾기
  const fingerFrets = chord.fingers.map((f) => f[1]);
  const minFret =
    fingerFrets.length > 0 ? Math.min(...fingerFrets) : chord.flat;
  // const maxFret =
  //   fingerFrets.length > 0 ? Math.max(...fingerFrets) : chord.flat + 3;

  const lines: React.ReactNode[] = [];

  for (let i = 0; i <= rowCount; i++) {
    lines.push(
      <line
        key={`h${i}`}
        x1={cellSize + 10}
        y1={(i + 1) * cellSizeY}
        x2={cellSize * (columnCount + 1) + 10}
        y2={(i + 1) * cellSizeY}
        strokeWidth={i === 0 ? 4 : 1}
        stroke="black"
      />,
    );
  }

  for (let i = 0; i <= columnCount; i++) {
    lines.push(
      <line
        key={`v${i}`}
        x1={(i + 1) * cellSize + 10}
        y1={cellSizeY}
        x2={(i + 1) * cellSize + 10}
        y2={cellSizeY * (rowCount + 1)}
        stroke="black"
      />,
    );
  }

  useEffect(() => {
    console.log('min fret', minFret);
    const lines = chord.fingers.map((item) => item[0]);
    const resultLines = chord.mute ? lines.concat(chord.mute) : lines;
    const removeSet = new Set(resultLines);
    const resultArray = [1, 2, 3, 4, 5, 6].filter(
      (item) => !removeSet.has(item),
    );
    setOpenFingers([...resultArray]);
  }, [chord.fingers, chord.mute]);

  return (
    <ContainerStyle>
      <div className="chord-wrapper">
        <h1>{chord.chord}</h1>
      </div>
      <div>
        <svg
          width={cellSize * columnCount + cellSize * 2 + 10}
          height={cellSizeY * rowCount + cellSizeY * 2}
        >
          {/* 실제 운지 범위에 맞춰 프렛 번호 표시 */}
          {minFret > 0 ? (
            <FlatChord flat={minFret} position={1} />
          ) : (
            <FlatChord flat={minFret + 1} position={1} />
          )}
          {minFret > 0 ? (
            <FlatChord flat={minFret + 1} position={2} />
          ) : (
            <FlatChord flat={minFret + 2} position={2} />
          )}
          {minFret > 0 ? (
            <FlatChord flat={minFret + 2} position={3} />
          ) : (
            <FlatChord flat={minFret + 3} position={3} />
          )}
          {minFret > 0 ? (
            <FlatChord flat={minFret + 3} position={4} />
          ) : (
            <FlatChord flat={minFret + 4} position={4} />
          )}
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
              // 실제 프렛 위치를 디스플레이 위치로 변환
              const displayFret =
                minFret <= 1 ? item[1] : item[1] - minFret + 1;
              return (
                displayFret !== 0 && (
                  <FingerMark key={index} line={item[0]} flat={displayFret} />
                )
              );
            })}
        </svg>
      </div>
    </ContainerStyle>
  );
};

export default Chords;
