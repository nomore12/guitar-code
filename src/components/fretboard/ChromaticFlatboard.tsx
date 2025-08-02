import React from 'react';
import NoteMarker from './ChromaticNoteMarker';
import useNoteStore from '../../store/useNoteStore';

// Note 타입은 src/types/Note.d.ts 에 전역 선언되어 있다고 가정합니다.

interface PropsType {
  handleNodeClick: (node: ChromaticNote) => void;
  handleReset?: () => void;
  selectedFingerPattern: number[];
  shouldReversePattern: boolean;
  practiceMode: string;
}

function getNoteNumber(renderNote: number) {
  switch (renderNote) {
    case 1:
      return 4;
    case 2:
      return 3;
    case 3:
      return 2;
    case 4:
      return 1;
    default:
      return String(renderNote);
  }
}

const ChromaticFlatboard: React.FC<PropsType> = ({
  handleNodeClick,
  handleReset,
  selectedFingerPattern,
  shouldReversePattern,
  practiceMode,
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
  // console.log('ChromaticFlatboard RENDER - 스토어 값:', {
  //   isPracticePlaying,
  //   currentIndex,
  //   notesLength: practiceNodesFromStore?.length,
  // });

  // 스토어의 첫 번째 노트 및 전체 노트 정보 로깅 추가
  if (practiceNodesFromStore && practiceNodesFromStore.length > 0) {
    console.log(
      '[Flatboard Debug] All notes from store:',
      practiceNodesFromStore.map((note, idx) => ({
        index: idx,
        flatNumber: note.flatNumber,
        lineNumber: note.lineNumber,
        chromaticNumber: note.chromaticNumber,
        chord: note.chord,
      })),
    );
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
        (() => {
          // Finger pattern 순서대로 노트를 정렬
          const useReversePattern =
            shouldReversePattern && practiceMode === 'traverse_with_repeat';
          const pattern = useReversePattern
            ? [...selectedFingerPattern].reverse()
            : selectedFingerPattern;

          // pattern 순서대로 노트를 재정렬
          const sortedNotes = pattern
            .map((fingerNumber, patternIndex) => {
              // 해당 손가락 번호와 일치하는 노트 찾기
              const noteIndex = practiceNodesFromStore.findIndex(
                (note) => note.chromaticNumber === fingerNumber,
              );
              if (noteIndex !== -1) {
                return {
                  note: practiceNodesFromStore[noteIndex],
                  originalIndex: noteIndex,
                  renderIndex: patternIndex,
                };
              }
              return null;
            })
            .filter(
              (
                item,
              ): item is {
                note: ChromaticNote;
                originalIndex: number;
                renderIndex: number;
              } => item !== null,
            );

          console.log('[Flatboard Debug] Sorted notes by finger pattern:', {
            pattern,
            useReversePattern,
            sortedNotes: sortedNotes.map((item) => ({
              fingerNumber: item.note.chromaticNumber,
              fretNumber: item.note.flatNumber,
              renderIndex: item.renderIndex,
              originalIndex: item.originalIndex,
            })),
          });

          return sortedNotes.map((item, renderIndex) => {
            const { note, originalIndex } = item;
            const isActive =
              isPracticePlaying &&
              practiceNodesFromStore.length > 0 &&
              currentIndex === originalIndex; // 메트로놈은 원래 인덱스 사용

            // Y 좌표 계산
            const stringIndexForNote_TEST = note.lineNumber - 1;
            const calculatedY =
              extraPadding + (stringIndexForNote_TEST + 1) * stringSpacing;

            // X 좌표 계산 (실제 프렛 위치 사용)
            const calculatedX =
              (note.flatNumber - 0.5) * fretWidth + paddingLeft + extraPadding;

            return (
              <NoteMarker
                key={`practice-${note.lineNumber}-${note.flatNumber}-${renderIndex}`}
                fret={note.flatNumber}
                lineNumber={note.lineNumber}
                calculatedX={calculatedX}
                calculatedY={calculatedY}
                note={String(sortedNotes[renderIndex].originalIndex + 1)}
                color={
                  isActive ? 'rgba(205, 126, 126, 1)' : 'rgb(214, 214, 214)'
                }
                handleNodeClick={handleNodeClick}
              />
            );
          });
        })()}
    </svg>
  );
};

export default ChromaticFlatboard;
