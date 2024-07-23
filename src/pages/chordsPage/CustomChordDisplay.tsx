import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Separator } from '@radix-ui/themes';
import chordsData from '../../data/openChords.json';
import ChordBadge from './ChordBadge';

interface PropsType {
  setCustomChords: (chords: ChordProps[]) => void;
}

const chordNames = [
  'A',
  'Am',
  'C',
  'D',
  'Dm',
  'E',
  'Em',
  'F',
  'G',
  'A7',
  'Am7',
  'Amaj7',
  'Bb',
  'B7',
  'Bm',
  'Bdim',
  'C7',
  'Cmaj7',
  'D7',
  'Dm7',
  'Dmaj7',
  'E7',
  'Em7',
  'F#m',
  'Fmaj7',
  'G7',
  'X',
];

const allChords: ChordsDataProps = chordsData as unknown as ChordsDataProps;

const CustomChordDisplay: React.FC<PropsType> = ({ setCustomChords }) => {
  const [chords, setChords] = useState<ChordProps[]>([]); // Initializing as an empty array

  const onChordClick = (chord: string) => {
    const newChord = allChords[chord];
    const newChords = chords ? [...chords, newChord] : [newChord];
    setChords(newChords);
    setCustomChords(newChords);
  };

  const onDelete = (index: number) => {
    if (chords) {
      const newChords = chords.filter((_, i) => i !== index);
      setChords(newChords);
      setCustomChords(newChords); // Updating setCustomChords here as well
    }
  };

  return (
    <Box style={{ marginTop: '10px' }}>
      <Box
        style={{
          border: '1px solid #ececec',
          borderRadius: '10px',
          padding: '8px',
        }}
      >
        <Flex gap="3" wrap="wrap">
          {chords.map((chord, index) => (
            <div key={index}>
              <ChordBadge
                chord={chord.chord}
                onDelete={() => onDelete(index)}
              />
            </div>
          ))}
        </Flex>
      </Box>
      <Separator my="3" size="4" />
      <Flex width="692px" wrap="wrap" gap="2">
        {chordNames.map((chord) => (
          <Box key={chord}>
            <Button
              variant="outline"
              size="1"
              onClick={() => onChordClick(chord)}
            >
              {chord}
            </Button>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default CustomChordDisplay;
