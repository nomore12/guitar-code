import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Button, TextField } from '@mui/material';
import Chords from '../components/chords/Chords';
import { generateChordFromTemplate } from '../utils/chordGenerator';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ChordDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const ChordContainer = styled.div`
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
`;

const ChordGeneratorTest: React.FC = () => {
  const [chordName, setChordName] = useState('');
  const [chords, setChords] = useState<any[]>([]);

  const handleGenerate = () => {
    if (!chordName) return;

    const generated = generateChordFromTemplate(chordName);
    setChords(generated);
  };

  const testChords = [
    'C',
    'Am',
    'G7',
    'Fm7',
    'Bb',
    'C#dim7',
    'Ebm7b5',
    'Gsus4',
    'A',
    'E',
    'D',
    'F',
    'B',
  ];

  const handleTestChord = (chord: string) => {
    setChordName(chord);
    const generated = generateChordFromTemplate(chord);
    setChords(generated);
  };

  return (
    <Container>
      <h1>코드 생성기 테스트</h1>

      <Controls>
        <TextField
          label="코드 이름"
          value={chordName}
          onChange={(e) => setChordName(e.target.value)}
          placeholder="예: C, Am, G7, Bbm7"
          size="small"
        />
        <Button variant="contained" onClick={handleGenerate}>
          생성
        </Button>
      </Controls>

      <Box mb={3}>
        <h3>테스트 코드:</h3>
        <Box display="flex" gap={1} flexWrap="wrap">
          {testChords.map((chord) => (
            <Button
              key={chord}
              variant="outlined"
              size="small"
              onClick={() => handleTestChord(chord)}
            >
              {chord}
            </Button>
          ))}
        </Box>
      </Box>

      {chords.length > 0 && (
        <>
          <h3>{chordName} 코드 생성 결과:</h3>
          <ChordDisplay>
            {chords.map((chord, index) => (
              <ChordContainer key={index}>
                <p>
                  베이스:{' '}
                  {chord.fingers.some((f: any) => f[0] === 6)
                    ? '6번줄'
                    : '5번줄'}
                </p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  fingers: {JSON.stringify(chord.fingers)}
                  <br />
                  mute: {JSON.stringify(chord.mute)}
                  <br />
                  flat: {chord.flat}
                </p>
                <Chords chord={chord} />
              </ChordContainer>
            ))}
          </ChordDisplay>
        </>
      )}
    </Container>
  );
};

export default ChordGeneratorTest;
