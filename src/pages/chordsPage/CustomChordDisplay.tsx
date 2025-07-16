import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Separator } from '@radix-ui/themes';
import chordsData from '../../data/openChords.json';
import ChordBadge from './ChordBadge';
import { generateChordFromTemplate } from '../../utils/chordGenerator';
import {
  Select,
  Box as MuiBox,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface PropsType {
  setCustomChords: (chords: ChordProps[]) => void;
}

const chordNames = [
  'A',
  'A7',
  'Am',
  'Am7',
  'Amaj7',
  'B',
  'B7',
  'Bdim',
  'Bm',
  'C',
  'C7',
  'Cmaj7',
  'D',
  'D7',
  'Dm',
  'Dm7',
  'Dmaj7',
  'E',
  'E7',
  'Em',
  'Em7',
  'Emaj7',
  'F',
  'F7',
  'Fm',
  'Fm7',
  'Fmaj7',
  'G',
  'G7',
  'Gb',
  'Gm',
  'Gm7',
  'Gmaj7',
  'X',
];

const highChordBaseRoots = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const highChordAccidentals = ['', '#', 'b'];
const highChordTypes = [
  '',
  'm',
  '7',
  'maj7',
  'm7',
  'minmaj7',
  'm7b5',
  'dim7',
  'sus4',
  '7sus4',
];

const makeHighChordNames = () => {
  const names: string[] = [];
  for (const root of highChordBaseRoots) {
    for (const suffix of highChordTypes) {
      // 중복 방지: Bb와 A# 등 enharmonic은 하나만 남기고 싶으면 여기서 필터 가능
      names.push(root + suffix);
    }
  }
  return names;
};

const highChordNames = makeHighChordNames();

const allChords: ChordsDataProps = chordsData as unknown as ChordsDataProps;

const CustomChordDisplay: React.FC<PropsType> = ({ setCustomChords }) => {
  const [chords, setChords] = useState<ChordProps[]>([]); // Initializing as an empty array
  const [selectedRoot, setSelectedRoot] = useState('A');
  const [selectedAccidental, setSelectedAccidental] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // 5번줄 하이코드용 상태
  const [selectedRoot5, setSelectedRoot5] = useState('A');
  const [selectedAccidental5, setSelectedAccidental5] = useState('');
  const [selectedType5, setSelectedType5] = useState('');

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

  const handleHighChordGenerate = (line: 6 | 5 | undefined) => {
    const chord = selectedRoot + selectedAccidental + selectedType;
    const generated = generateChordFromTemplate(chord, line);
    if (generated && generated.length > 0) {
      console.log(generated);
      setChords([...chords, generated[0]]);
      setCustomChords([...chords, generated[0]]);
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
      {/* 6번줄 하이코드 영역 */}
      <Separator my="3" size="4" />
      <Box mb="1" style={{ fontWeight: 600 }}>
        6번줄 하이코드
      </Box>
      <Flex align="center" gap="2" mb="2">
        <FormControl size="small">
          <InputLabel>코드</InputLabel>
          <Select
            value={selectedRoot}
            label="코드"
            onChange={(e) => setSelectedRoot(e.target.value)}
            style={{ minWidth: 60 }}
          >
            {highChordBaseRoots.map((root) => (
              <MenuItem key={root} value={root}>
                {root}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>반음</InputLabel>
          <Select
            value={selectedAccidental}
            label="반음"
            onChange={(e) => setSelectedAccidental(e.target.value)}
            style={{ minWidth: 60 }}
          >
            <MenuItem value="">(없음)</MenuItem>
            <MenuItem value="#">#</MenuItem>
            <MenuItem value="b">b</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>특수코드</InputLabel>
          <Select
            value={selectedType}
            label="특수코드"
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ minWidth: 100 }}
          >
            <MenuItem value="">메이저</MenuItem>
            <MenuItem value="m">m (마이너)</MenuItem>
            <MenuItem value="7">7</MenuItem>
            <MenuItem value="maj7">maj7</MenuItem>
            <MenuItem value="m7">m7</MenuItem>
            <MenuItem value="minmaj7">minmaj7</MenuItem>
            <MenuItem value="m7b5">m7b5</MenuItem>
            <MenuItem value="dim7">dim7</MenuItem>
            <MenuItem value="sus4">sus4</MenuItem>
            <MenuItem value="7sus4">7sus4</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="soft"
          size="1"
          onClick={() => handleHighChordGenerate(6)}
        >
          코드 생성
        </Button>
      </Flex>
      <Separator my="3" size="4" />
      {/* 5번줄 하이코드 영역 */}
      <Box mb="1" style={{ fontWeight: 600 }}>
        5번줄 하이코드
      </Box>
      <Flex align="center" gap="2" mb="2">
        <FormControl size="small">
          <InputLabel>코드</InputLabel>
          <Select
            value={selectedRoot5}
            label="코드"
            onChange={(e) => setSelectedRoot5(e.target.value)}
            style={{ minWidth: 60 }}
          >
            {highChordBaseRoots.map((root) => (
              <MenuItem key={root} value={root}>
                {root}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>반음</InputLabel>
          <Select
            value={selectedAccidental5}
            label="반음"
            onChange={(e) => setSelectedAccidental5(e.target.value)}
            style={{ minWidth: 60 }}
          >
            <MenuItem value="">(없음)</MenuItem>
            <MenuItem value="#">#</MenuItem>
            <MenuItem value="b">b</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>특수코드</InputLabel>
          <Select
            value={selectedType5}
            label="특수코드"
            onChange={(e) => setSelectedType5(e.target.value)}
            style={{ minWidth: 100 }}
          >
            <MenuItem value="">메이저</MenuItem>
            <MenuItem value="m">m (마이너)</MenuItem>
            <MenuItem value="7">7</MenuItem>
            <MenuItem value="maj7">maj7</MenuItem>
            <MenuItem value="m7">m7</MenuItem>
            <MenuItem value="minmaj7">minmaj7</MenuItem>
            <MenuItem value="m7b5">m7b5</MenuItem>
            <MenuItem value="dim7">dim7</MenuItem>
            <MenuItem value="sus4">sus4</MenuItem>
            <MenuItem value="7sus4">7sus4</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="soft"
          size="1"
          onClick={() => handleHighChordGenerate(5)}
        >
          코드 생성
        </Button>
      </Flex>
      <Separator my="3" size="4" />
    </Box>
  );
};

export default CustomChordDisplay;
