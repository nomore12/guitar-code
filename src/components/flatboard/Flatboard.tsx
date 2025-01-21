import React, { useEffect, useState } from 'react';
import NoteMarker from './NoteMarker';

interface PropsType {
  rootChord: string;
  selectedScale: 'major' | 'minor';
}

const Flatboard: React.FC<PropsType> = ({ rootChord, selectedScale }) => {
  const [displayScale, setDisplayScale] = useState<
    { flatNumber: number; lineNumber: number; chord: string }[]
  >([]);

  const strings = 6; // Number of guitar strings
  const frets = 12; // Number of frets to render
  const fretboardWidth = 960; // Width of the fretboard
  const fretboardHeight = 200; // Height of the fretboard
  const paddingLeft = 24; // Space before the 1st fret
  const extraPadding = 50; // Extra padding around the SVG
  const totalWidth = fretboardWidth + extraPadding * 2; // Total SVG width
  const totalHeight = fretboardHeight + extraPadding * 2; // Total SVG height
  const fretWidth = (fretboardWidth - paddingLeft) / frets; // Dynamically calculate fret width
  const stringSpacing = fretboardHeight / (strings + 1); // Dynamically calculate string spacing

  const generateScale = (
    root: string,
    scaleType: 'major' | 'minor' | 'custom',
    scaleIntervals?: number[],
  ) => {
    const tuning = ['E', 'A', 'D', 'G', 'B', 'E']; // 표준 조율 (6번줄부터 1번줄)
    const notes = [
      'A',
      'A#',
      'B',
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
    ]; // 12음계

    // 메이저 및 마이너 스케일 기본 정의
    const predefinedScales: Record<string, number[]> = {
      major: [0, 2, 4, 5, 7, 9, 11], // 메이저 스케일: 루트, 2도, 3도, 4도, 5도, 6도, 7도
      minor: [0, 2, 3, 5, 7, 8, 10], // 마이너 스케일: 루트, 2도, b3도, 4도, 5도, b6도, b7도
      pentatonicMajor: [0, 2, 4, 7, 9], // 메이저 펜타토닉
      pentatonicMinor: [0, 3, 5, 7, 10], // 마이너 펜타토닉
    };

    // 선택된 스케일 인터벌 계산
    const intervals =
      scaleType === 'custom'
        ? scaleIntervals || []
        : predefinedScales[scaleType] || [];

    if (intervals.length === 0) {
      throw new Error('Invalid scale type or custom intervals are missing.');
    }

    // 루트 음계부터 스케일 음계 생성
    const rootIndex = notes.indexOf(root);
    const scaleNotes = intervals.map(
      (interval) => notes[(rootIndex + interval) % notes.length],
    );

    const frets = 12; // 프렛 수
    const strings = 6; // 줄 수
    const scale = [];

    // 특정 음의 다음 음계를 계산
    const getNextNote = (currentNote: string, step: number) => {
      const currentIndex = notes.indexOf(currentNote);
      const nextIndex = (currentIndex + step) % notes.length;
      return notes[nextIndex];
    };

    // 줄 번호와 프렛 번호에 따라 스케일 음계 필터링
    for (let lineNumber = 1; lineNumber <= strings; lineNumber++) {
      const openNote = tuning[strings - lineNumber]; // 해당 줄의 개방현 음계
      for (let flatNumber = 0; flatNumber <= frets; flatNumber++) {
        const chord = getNextNote(openNote, flatNumber);
        if (scaleNotes.includes(chord)) {
          scale.push({ lineNumber, flatNumber, chord });
        }
      }
    }

    return scale;
  };

  useEffect(() => {
    const scale = generateScale(rootChord, selectedScale);
    setDisplayScale(scale);
  }, [rootChord, selectedScale]);

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      style={{ backgroundColor: '#f4f4f4', border: '1px solid #ccc' }}
    >
      {/* Open chord */}
      {['E', 'A', 'G', 'D', 'B', 'E'].map((chord, index) => (
        <text
          key={`open-chord-${index}`}
          x={extraPadding - 10}
          y={extraPadding + stringSpacing + stringSpacing * index + 5}
          fontSize={16}
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
          y1={extraPadding + stringIndex * stringSpacing + stringSpacing}
          x2={fretboardWidth + extraPadding}
          y2={extraPadding + stringIndex * stringSpacing + stringSpacing}
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
          strokeWidth={fretIndex === 0 ? 6 : 2} // Thicker line for the nut (0th fret)
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

      {/* Fret Markers */}
      {[3, 5, 7, 9].map((fret) => (
        <circle
          key={`marker-${fret}`}
          cx={(fret - 0.5) * fretWidth + paddingLeft + extraPadding}
          cy={fretboardHeight / 2 + extraPadding}
          r="6"
          fill="#c0c0c0"
        />
      ))}
      {/* Double Dot on 12th Fret */}
      <circle
        cx={(12 - 0.5) * fretWidth + paddingLeft + extraPadding}
        cy={stringSpacing * 2 + extraPadding + stringSpacing / 2} // 두 번째 칸의 중앙
        r="6"
        fill="#c0c0c0"
      />
      <circle
        cx={(12 - 0.5) * fretWidth + paddingLeft + extraPadding}
        cy={stringSpacing * 4 + extraPadding + stringSpacing / 2} // 네 번째 칸의 중앙
        r="6"
        fill="#c0c0c0"
      />
      {/*<NoteMarker fret={1} string={6} note="F" color="red" />*/}
      {displayScale &&
        displayScale.map((chord, index) => (
          <NoteMarker
            key={`chord-${index}`}
            fret={chord.flatNumber}
            string={chord.lineNumber}
            note={chord.chord}
            color={chord.chord === rootChord ? 'red' : ''}
          />
        ))}
    </svg>
  );
};

export default Flatboard;
