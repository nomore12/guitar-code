import React, { useEffect, useState } from 'react';
import Flatboard from '../../components/fretboard/Flatboard';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Select, SelectChangeEvent } from '@mui/material';
import Metronome from '../../components/metronome/Metronome';

const FlatboardPage: React.FC = () => {
  const [rootChord, setrootChord] = useState('A');
  const [selectedScale, setSelectedScale] = useState('major');

  const handleChangeRootChord = (event: SelectChangeEvent) => {
    console.log(event.target.value);
    setrootChord(event.target.value as string);
  };
  const handleChangeSelectedScale = (event: SelectChangeEvent) => {
    console.log(event.target.value);
    setSelectedScale(event.target.value as string);
  };

  useEffect(() => {
    console.log(rootChord);
  }, []);

  return (
    <div>
      <Flatboard
        rootChord={rootChord}
        selectedScale={selectedScale as 'major' | 'minor'}
      />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box>
          <InputLabel id="demo-simple-select-label-chord">코드</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={rootChord}
            label="코드"
            onChange={handleChangeRootChord}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="D">D</MenuItem>
            <MenuItem value="E">E</MenuItem>
            <MenuItem value="F">F</MenuItem>
            <MenuItem value="G">G</MenuItem>
          </Select>
        </Box>
        <Box>
          <InputLabel id="demo-simple-select-label-scale">스케일</InputLabel>
          <Select
            labelId="demo-simple-select-label-scale"
            id="demo-simple-select-scale"
            value={selectedScale}
            label="스케일"
            onChange={handleChangeSelectedScale}
          >
            <MenuItem value="major">Major</MenuItem>
            <MenuItem value="minor">Minor</MenuItem>
            <MenuItem value="pentatonicMajor">Pentatonic Major</MenuItem>
            <MenuItem value="pentatonicMinor">Pentatonic Minor</MenuItem>
            <MenuItem value="ionian">Ionian</MenuItem>
            <MenuItem value="dorian">Dorian</MenuItem>
            <MenuItem value="phrygian">Phrygian</MenuItem>
            <MenuItem value="lydian">Lydian</MenuItem>
            <MenuItem value="mixolydian">Mixolydian</MenuItem>
            <MenuItem value="aeolian">Aeolian</MenuItem>
            <MenuItem value="locrian">Locrian</MenuItem>
            <MenuItem value="melodicMinor">Melodic Minor</MenuItem>
            <MenuItem value="harmonicMinor">Harmonic Minor</MenuItem>
            <MenuItem value="minorBlues">Minor Blues</MenuItem>
            <MenuItem value="majorBlues">Major Blues</MenuItem>
          </Select>
        </Box>
      </Box>
      <Box>
        <Metronome />
      </Box>
    </div>
  );
};

export default FlatboardPage;
