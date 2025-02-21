import React, { useEffect, useRef, useState } from 'react';
import Soundfont, { InstrumentName } from 'soundfont-player';
import * as Tone from 'tone';
import CustomChordDisplay from './chordsPage/CustomChordDisplay';
import ChordBadge from './chordsPage/ChordBadge';
import { Box, Button, Flex } from '@radix-ui/themes';
import ChordMeasure from '../components/dnd/ChordMeasure';

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [chordProgression, setChordProgression] = useState<string[]>([]);
  const [bit, setBit] = useState<string>('4');
  const [bpmValue, setBpmValue] = useState<number>(100);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBit(event.target.value);
  };

  const addChord = (chord: string) => {
    setChordProgression([...chordProgression, chord]);
  };

  const playChord = async (chord: string, stroke: boolean = true) => {
    const audioContext = new ((window as any).AudioContext ||
      (window as any).webkitAudioContext)();
    const player = await Soundfont.instrument(
      audioContext,
      'acoustic_guitar_steel',
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

  const deleteChord = (chord: string) => {
    setChordProgression(chordProgression.filter((item) => item !== chord));
  };

  const playChordProgression = () => {
    // 비트 수(예: 4, 8, 16)
    const beatsPerMeasure = parseInt(bit);

    // 한 마디 시간 (초) = (60 / BPM) * 4
    const measureDuration = (60 / bpmValue) * 4;

    // 한 박자(비트)마다 연주할 간격 (초)
    // 예: 4비트라면 한 마디가 4박자이므로 measureDuration / 4
    const strokeDuration = measureDuration / beatsPerMeasure;

    chordProgression.forEach((chord, index) => {
      // 해당 코드가 시작될 마디의 시작 시점(초)
      const measureStartTime = index * measureDuration;

      // beatsPerMeasure(4번)만큼 각각 시간을 두고 코드(strum)를 연주
      for (let i = 0; i < beatsPerMeasure; i++) {
        // i번째 박자에서 연주될 실제 시간(초)
        // 이전 마디들이 끝난 시점 + (박자 수 × 박자 간격)
        const strokeTime = measureStartTime + i * strokeDuration;

        // setTimeout을 이용해 실제 시간차를 두고 연주
        setTimeout(() => {
          // playChord(chord, direction)
          // i가 짝수면 다운스트럼, 홀수면 업스트럼처럼 구현 가능
          playChord(chord, i % 2 === 0);
        }, strokeTime * 1000);
      }
    });
  };

  return (
    <div>
      <ChordMeasure />
      <div>
        <label htmlFor="bitSelect">Select Bit</label>
        <select
          id="bitSelect"
          value={bit}
          onChange={handleChange}
          style={{ marginLeft: '10px' }}
        >
          {['4', '8', '16'].map((bit) => (
            <option key={bit} value={bit}>
              {bit + ' bit'}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bpmSelect">Select BPM</label>
        <input
          id="bpmSelect"
          type="number"
          value={bpmValue}
          onChange={(e) => setBpmValue(parseInt(e.target.value))}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {chordProgression &&
          chordProgression.map((item, index) => (
            <div key={`${item}-${index}`}>
              <ChordBadge
                chord={item}
                onDelete={() => deleteChord(item)}
              ></ChordBadge>
            </div>
          ))}
      </div>
      <Flex wrap="wrap" gap="2">
        {openPositionChordKeys.map((key, index) => (
          <Box key={`${key}-${index}`}>
            <Button variant="outline" size="1" onClick={() => addChord(key)}>
              {key}
            </Button>
          </Box>
        ))}
      </Flex>
      <div>
        <button onClick={playChordProgression}>Play</button>
      </div>
    </div>
  );
};

export default GuitarChordPlayer;
