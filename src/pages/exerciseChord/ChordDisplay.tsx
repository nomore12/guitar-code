import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import CompactFingerMark from './CompactFingerMark';
import CompactMuteMark from './CompactMuteMark';
import CompactOpenMark from './CompactOpenMark';
import CompactFlatChord from './CompactFlatChord';

interface ChordDisplayProps {
  chord: {
    chord: string;
    fingers: number[][];
    mute: number[] | [];
    flat: number;
  };
  focused?: boolean;
  hide?: boolean;
}

interface StyledWrapperProps {
  $focused?: boolean;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  width: 160px;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$focused ? 1 : 0.5)};
  cursor: pointer;
  border: 1px solid black;
  display: flex;
  justify-content: center;

  &:hover {
    opacity: ${(props) => (props.$focused ? 1 : 0.7)};
  }
`;

const ChordNameWrapper = styled.div`
  border: 1px solid black;
  width: 54px;
  min-width: 54px;
  max-width: 54px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  overflow: hidden;
  box-sizing: border-box;

  h1 {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
    padding: 2px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;

    /* 텍스트가 길면 자동으로 폰트 크기 축소 */
    &[data-long='true'] {
      font-size: 0.85rem;
    }

    &[data-very-long='true'] {
      font-size: 0.7rem;
    }

    &[data-extra-long='true'] {
      font-size: 0.6rem;
    }
  }
`;

const ChordGridWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const HiddenFingerWrapper = styled.div`
  svg {
    circle {
      display: none;
    }
  }
`;

const ChordDisplay: React.FC<ChordDisplayProps> = ({
  chord,
  focused = false,
  hide = false,
}) => {
  // 텍스트 길이에 따른 데이터 속성 계산
  const getTextLengthClass = (text: string) => {
    if (text.length >= 8) return 'extra-long';
    if (text.length >= 6) return 'very-long';
    if (text.length >= 5) return 'long';
    return 'normal';
  };

  const textLengthClass = getTextLengthClass(chord.chord);
  const rowCount = 4;
  const columnCount = 5;
  const cellSize = 14; // 20 -> 14로 축소
  const cellSizeY = 20; // 30 -> 20으로 축소

  const [openFingers, setOpenFingers] = useState<number[]>([]);

  // 실제 운지된 프렛의 최소값과 최대값 찾기
  const fingerFrets = chord.fingers.map((f) => f[1]);
  const minFret =
    fingerFrets.length > 0 ? Math.min(...fingerFrets) : chord.flat;

  const lines: React.ReactNode[] = [];

  for (let i = 0; i <= rowCount; i++) {
    lines.push(
      <line
        key={`h${i}`}
        x1={cellSize + 10}
        y1={(i + 1) * cellSizeY}
        x2={cellSize * (columnCount + 1) + 10}
        y2={(i + 1) * cellSizeY}
        strokeWidth={i === 0 ? 3 : 1} // 4 -> 3으로 축소
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
    const lines = chord.fingers.map((item) => item[0]);
    const resultLines = chord.mute ? lines.concat(chord.mute) : lines;
    const removeSet = new Set(resultLines);
    const resultArray = [1, 2, 3, 4, 5, 6].filter(
      (item) => !removeSet.has(item),
    );
    setOpenFingers([...resultArray]);
  }, [chord.fingers, chord.mute]);

  const chordGrid = (
    <svg
      width={cellSize * columnCount + cellSize * 2 + 10}
      height={cellSizeY * rowCount + cellSizeY * 2}
    >
      {/* 실제 운지 범위에 맞춰 프렛 번호 표시 */}
      {minFret > 0 ? (
        <CompactFlatChord flat={minFret} position={1} />
      ) : (
        <CompactFlatChord flat={minFret + 1} position={1} />
      )}
      {minFret > 0 ? (
        <CompactFlatChord flat={minFret + 1} position={2} />
      ) : (
        <CompactFlatChord flat={minFret + 2} position={2} />
      )}
      {minFret > 0 ? (
        <CompactFlatChord flat={minFret + 2} position={3} />
      ) : (
        <CompactFlatChord flat={minFret + 3} position={3} />
      )}
      {minFret > 0 ? (
        <CompactFlatChord flat={minFret + 3} position={4} />
      ) : (
        <CompactFlatChord flat={minFret + 4} position={4} />
      )}
      {lines}

      {!hide &&
        chord.mute &&
        chord.mute.map((item, index) => {
          return <CompactMuteMark key={`mute-${index}`} line={item} />;
        })}
      {!hide &&
        openFingers &&
        openFingers.map((item, index) => {
          return <CompactOpenMark key={`open-${index}`} line={item} />;
        })}
      {!hide &&
        chord.fingers &&
        chord.fingers.map((item, index) => {
          // 실제 프렛 위치를 디스플레이 위치로 변환
          const displayFret = minFret <= 1 ? item[1] : item[1] - minFret + 1;
          return (
            displayFret !== 0 && (
              <CompactFingerMark
                key={index}
                line={item[0]}
                flat={displayFret}
              />
            )
          );
        })}
    </svg>
  );

  return (
    <StyledWrapper $focused={focused}>
      <ChordNameWrapper>
        <h1
          data-long={textLengthClass === 'long' ? 'true' : 'false'}
          data-very-long={textLengthClass === 'very-long' ? 'true' : 'false'}
          data-extra-long={textLengthClass === 'extra-long' ? 'true' : 'false'}
        >
          {chord.chord}
        </h1>
      </ChordNameWrapper>
      <ChordGridWrapper>
        {hide ? (
          <HiddenFingerWrapper>{chordGrid}</HiddenFingerWrapper>
        ) : (
          chordGrid
        )}
      </ChordGridWrapper>
    </StyledWrapper>
  );
};

export default ChordDisplay;
