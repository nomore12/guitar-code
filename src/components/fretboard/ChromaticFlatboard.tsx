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

  // 스토어의 첫 번째 노트 및 전체 노트 정보 로깅 추가
  if (practiceNodesFromStore && practiceNodesFromStore.length > 0) {
    console.log(
      '[Flatboard Debug] First note from store:',
      JSON.stringify({
        line: practiceNodesFromStore[0].lineNumber,
        chord: practiceNodesFromStore[0].chord,
        cn: practiceNodesFromStore[0].chromaticNumber,
      }),
    );
    // 전체 노트 정보도 필요하다면 여기서 더 자세히 로깅할 수 있습니다.
    // console.log('[Flatboard Debug] All notes for Y-coord check:',
    //   JSON.stringify(practiceNodesFromStore.map(n => ({ l: n.lineNumber, c: n.chord, cn: n.chromaticNumber })))
    // );
  } else {
    console.log(
      '[Flatboard Debug] No practice notes in store or store is empty.',
    );
  }

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
          cy={extraPadding + 3.5 * stringSpacing}
          r="6"
          fill="#c0c0c0"
        />
      ))}
      <circle
        cx={(12 - 0.5) * fretWidth + paddingLeft + extraPadding}
        cy={extraPadding + 2.5 * stringSpacing}
        r="6"
        fill="#c0c0c0"
      />
      <circle
        cx={(12 - 0.5) * fretWidth + paddingLeft + extraPadding}
        cy={extraPadding + 4.5 * stringSpacing}
        r="6"
        fill="#c0c0c0"
      />

      {practiceNodesFromStore &&
        practiceNodesFromStore.map((note: ChromaticNote, mapIndex: number) => {
          const isActive =
            isPracticePlaying &&
            practiceNodesFromStore.length > 0 &&
            currentIndex === mapIndex;

          // y 좌표 계산 테스트: lineNumber 1을 SVG 상단(index 0)으로 매핑 시도
          // 기존: strings - note.lineNumber (6번줄 -> 0, 1번줄 -> 5)
          // 테스트: note.lineNumber - 1 (1번줄 -> 0, 6번줄 -> 5)
          const stringIndexForNote_TEST = note.lineNumber - 1;

          // Y 좌표 계산 시 위 테스트 인덱스 사용
          const calculatedY =
            extraPadding + (stringIndexForNote_TEST + 1) * stringSpacing;

          // X 좌표 계산 (이전 제안대로 Flatboard에서 계산)
          const calculatedX =
            (note.flatNumber - 0.5) * fretWidth + paddingLeft + extraPadding;

          if (note.lineNumber === 6 || note.lineNumber === 1) {
            // 1번 또는 6번 줄 노트만 로깅
            console.log('[Y-Test Debug]', {
              lineNumber: note.lineNumber,
              stringIndexForNote_TEST,
              calculatedY,
              isActive,
            });
          }

          return (
            <NoteMarker
              key={`practice-${note.lineNumber}-${note.flatNumber}-${mapIndex}`}
              fret={note.flatNumber}
              lineNumber={note.lineNumber}
              calculatedX={calculatedX}
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
