import React from 'react';
import NoteMarker from './ChromaticNoteMarker';
import useNoteStore from '../../store/useNoteStore';

// Note 타입은 src/types/Note.d.ts 에 전역 선언되어 있다고 가정합니다.

interface PropsType {
  handleNodeClick: (node: ChromaticNote) => void;
  handleReset?: () => void;
}

const ChromaticFlatboard: React.FC<PropsType> = ({
  handleNodeClick,
  handleReset,
}) => {
  const strings = 6;
  const frets = 12;
  const fretboardWidth = 960;
  const fretboardHeight = 200;
  const paddingLeft = 24;
  const extraPadding = 50;
  const totalWidth = fretboardWidth + extraPadding * 2;
  const totalHeight = fretboardHeight + extraPadding * 2;
  const fretWidth = (fretboardWidth - paddingLeft) / frets;
  const stringSpacing = fretboardHeight / (strings + 1);

  const {
    practiceNotes: practiceNodesFromStore,
    currentNoteIndex: currentIndex,
    isPracticePlaying,
  } = useNoteStore();

  // 렌더링 시 isPracticePlaying 값 확인을 위한 로그 추가
  console.log('ChromaticFlatboard RENDER - 스토어 값:', {
    isPracticePlaying,
    currentIndex,
    notesLength: practiceNodesFromStore?.length,
  });

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      style={{ backgroundColor: '#f4f4f4', border: '1px solid #ccc' }}
    >
      {/* Open chord text */}
      {['E', 'A', 'D', 'G', 'B', 'E'].reverse().map((chord, index) => (
        <text
          key={`open-chord-${index}`}
          x={extraPadding - 15}
          y={extraPadding + stringSpacing + stringSpacing * index + 5}
          fontSize={14}
          textAnchor="middle"
        >
          {chord}
        </text>
      ))}

      {/* Strings */}
      {[...Array(strings)].map((_, stringIndex) => (
        <line
          key={`string-${stringIndex}`}
          x1={paddingLeft + extraPadding}
          y1={extraPadding + (stringIndex + 1) * stringSpacing}
          x2={fretboardWidth + extraPadding}
          y2={extraPadding + (stringIndex + 1) * stringSpacing}
          stroke="black"
          strokeWidth={1.5}
        />
      ))}

      {/* Frets */}
      {[...Array(frets + 1)].map((_, fretIndex) => (
        <line
          key={`fret-${fretIndex}`}
          x1={fretIndex * fretWidth + paddingLeft + extraPadding}
          y1={extraPadding + stringSpacing}
          x2={fretIndex * fretWidth + paddingLeft + extraPadding}
          y2={totalHeight - extraPadding - stringSpacing}
          stroke="black"
          strokeWidth={fretIndex === 0 ? 6 : 2}
        />
      ))}

      {/* Fret Numbers */}
      {[...Array(frets)].map((_, fretIndex) => (
        <text
          key={`fret-number-${fretIndex}`}
          x={fretIndex * fretWidth + fretWidth / 2 + paddingLeft + extraPadding}
          y={extraPadding - 5}
          fontSize="12"
          textAnchor="middle"
        >
          {fretIndex + 1}
        </text>
      ))}

      {/* Fret Markers (standard dots) */}
      {[3, 5, 7, 9].map((fret) => (
        <circle
          key={`marker-single-${fret}`}
          cx={(fret - 0.5) * fretWidth + paddingLeft + extraPadding}
          cy={fretboardHeight / 2 + extraPadding + stringSpacing / 2}
          r="6"
          fill="#c0c0c0"
        />
      ))}
      <circle
        cx={(12 - 0.5) * fretWidth + paddingLeft + extraPadding}
        cy={extraPadding + stringSpacing * 2 + stringSpacing / 2}
        r="6"
        fill="#c0c0c0"
      />
      <circle
        cx={(12 - 0.5) * fretWidth + paddingLeft + extraPadding}
        cy={extraPadding + stringSpacing * 4 + stringSpacing / 2}
        r="6"
        fill="#c0c0c0"
      />

      {practiceNodesFromStore &&
        practiceNodesFromStore.map((note: ChromaticNote, mapIndex: number) => {
          const isActive =
            isPracticePlaying &&
            practiceNodesFromStore.length > 0 &&
            currentIndex === mapIndex;

          // y 좌표 계산: note.lineNumber (1~6)를 사용.
          // ChromaticFlatboard는 줄을 위에서부터 아래로 stringIndex 0~5 로 그림.
          // stringIndex 0은 6번줄 (E, 가장 위), stringIndex 5는 1번줄 (e, 가장 아래).
          // lineNumber 6 (6번줄) => stringIndex 0
          // lineNumber 1 (1번줄) => stringIndex 5
          // 변환: stringIndex_for_note = strings - note.lineNumber
          const stringIndexForNote = strings - note.lineNumber;
          const calculatedY =
            extraPadding + (stringIndexForNote + 1) * stringSpacing;

          return (
            <NoteMarker
              key={`practice-${note.lineNumber}-${note.flatNumber}-${mapIndex}`}
              fret={note.flatNumber}
              lineNumber={note.lineNumber}
              calculatedY={calculatedY}
              note={note.chord}
              color={
                isActive ? 'rgba(205, 126, 126, 1)' : 'rgba(129, 129, 129, 1)'
              }
              handleNodeClick={handleNodeClick}
            />
          );
        })}

      {handleReset && (
        <foreignObject
          x={totalWidth - extraPadding - 100 - 10}
          y={totalHeight - extraPadding - 40 - 5}
          width="100"
          height="40"
        >
          <div>
            <button
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'lightblue',
                border: '1px solid black',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default ChromaticFlatboard;
