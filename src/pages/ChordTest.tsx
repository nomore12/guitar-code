import React, { useEffect, useState } from 'react';
import Soundfont, { InstrumentName } from 'soundfont-player';
import * as Tone from 'tone';
import CustomChordDisplay from './chordsPage/CustomChordDisplay';
import ChordBadge from './chordsPage/ChordBadge';
import { Box, Button, Flex } from '@radix-ui/themes';

const guitarStyles: string[] = [
  'acoustic_guitar_nylon',
  'acoustic_guitar_steel',
  'electric_guitar_jazz',
  'electric_guitar_clean',
  'electric_guitar_muted',
  'overdriven_guitar',
  'distortion_guitar',
];

const openPositionChordKeys: string[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'Am',
  'Bm',
  'Dm',
  'Em',
  'Gm',
  'C#m',
  'F#m',
  'Ab',
  'Bb',
  'Db',
  'Eb',
  'Gb',
  'A7',
  'B7',
  'C7',
  'D7',
  'E7',
  'F7',
  'G7',
  'Am7',
  'Dm7',
  'Em7',
];

const openPositionChords: Record<string, string[]> = {
  C: ['C4', 'E4', 'G4', 'C5', 'E5'], // C 코드의 오픈 포지션
  G: ['G3', 'B3', 'D4', 'G4', 'B4'], // G 코드
  D: ['D4', 'F#4', 'A4', 'D5'], // D 코드
  A: ['A3', 'E4', 'A4', 'C#5'], // A 코드
  E: ['E3', 'G#4', 'B4', 'E5'], // E 코드
  Am: ['A3', 'E4', 'A4', 'C5'], // Am 코드
  Em: ['E3', 'G4', 'B4', 'E5'], // Em 코드
  Dm: ['D4', 'F4', 'A4', 'D5'], // Dm 코드
  F: ['F3', 'A3', 'C4', 'F4', 'A4'], // F 코드
  B: ['B3', 'D#4', 'F#4', 'B4'], // B 코드
  Bm: ['B3', 'D4', 'F#4', 'B4'], // Bm 코드
  'C#m': ['C#4', 'E4', 'G#4', 'C#5'], // C#m 코드
  Gm: ['G3', 'Bb3', 'D4', 'G4'], // Gm 코드
  'F#m': ['F#3', 'A3', 'C#4', 'F#4'], // F#m 코드
  Bb: ['Bb3', 'D4', 'F4', 'Bb4'], // Bb 코드
  Eb: ['Eb3', 'G3', 'Bb3', 'Eb4'], // Eb 코드
  Ab: ['Ab3', 'C4', 'Eb4', 'Ab4'], // Ab 코드
  Db: ['Db3', 'F3', 'Ab3', 'Db4'], // Db 코드
  Gb: ['Gb3', 'Bb3', 'Db4', 'Gb4'], // Gb 코드
  B7: ['B3', 'D#4', 'A4', 'F#4'], // B7 코드
  A7: ['A3', 'E4', 'G4', 'C#5'], // A7 코드
  D7: ['D4', 'F#4', 'C4', 'A4'], // D7 코드
  G7: ['G3', 'B3', 'F4', 'D4'], // G7 코드
  E7: ['E3', 'G#4', 'D4', 'B4'], // E7 코드
  C7: ['C4', 'E4', 'Bb3', 'G4'], // C7 코드
  F7: ['F3', 'A3', 'Eb4', 'C4'], // F7 코드
  Am7: ['A3', 'G3', 'C4', 'E4'], // Am7 코드
  Em7: ['E3', 'D3', 'G4', 'B4'], // Em7 코드
  Dm7: ['D4', 'F4', 'A4', 'C4'], // Dm7 코드
};

const openStrings = ['E3', 'A3', 'D4', 'G4', 'B4', 'E5']; // 옥타브 상향

const GuitarChordPlayer = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>(guitarStyles[0]);
  const [chordArr, setChordArr] = useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(event.target.value);
  };

  const playChord = async (chord: string, stroke: boolean = true) => {
    const audioContext = new ((window as any).AudioContext ||
      (window as any).webkitAudioContext)();
    const player = await Soundfont.instrument(
      audioContext,
      selectedStyle as InstrumentName,
    );

    // 코드에 해당하는 음 가져오기
    const notes = openPositionChords[chord];
    if (!notes) {
      console.error(`Unknown chord: ${chord}`);
      return;
    }

    // 스트로크 방향에 따른 노트 순서 설정
    const orderedNotes = stroke ? notes : [...notes].reverse();

    // 스트럼 효과를 위해 약간의 시간 차이를 추가하며 노트를 재생
    orderedNotes.forEach((note, index) => {
      player.play(note, audioContext.currentTime + index * 0.02, {
        duration: 1.5, // 각 음의 지속 시간
      });
    });
  };

  return (
    <div>
      <div>
        <label htmlFor="guitarStyle">Select Guitar Style:</label>
        <select
          id="guitarStyle"
          value={selectedStyle}
          onChange={handleChange}
          style={{ marginLeft: '10px' }}
        >
          {guitarStyles.map((style) => (
            <option key={style} value={style}>
              {style.replace(/_/g, ' ')} {/* 스타일을 보기 좋게 변환 */}
            </option>
          ))}
        </select>
        <p style={{ marginTop: '10px' }}>
          Selected Style: <strong>{selectedStyle}</strong>
        </p>
      </div>
      <Flex wrap="wrap" gap="2">
        {openPositionChordKeys.map((key, index) => (
          <Box key={key}>
            <Button variant="outline" size="1" onClick={() => playChord(key)}>
              {key}
            </Button>
          </Box>
        ))}
      </Flex>
      <div>
        <button>Play</button>
      </div>
    </div>
  );
};

export default GuitarChordPlayer;
