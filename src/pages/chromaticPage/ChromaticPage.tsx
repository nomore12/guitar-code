import React from 'react';
import ChromaticFlatboard from '../../components/fretboard/ChromaticFlatboard';
import MetronomeEngine from '../../components/metronome/MetronomeEngine';
import useNoteStore from '../../store/useNoteStore';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { useChromaticPractice } from './useChromaticPractice';
import {
  AVAILABLE_FINGER_NUMBERS,
  MIN_BPM,
  MAX_BPM,
  PracticeMode,
} from './chromaticLogic';
// ChromaticNote is global

const ChromaticPage: React.FC = () => {
  const {
    state,
    dispatch,
    handleBpmChange,
    handleBpmBlur,
    togglePractice,
    resetToInitialPracticeState,
    handleRandomFingerPattern,
    selectedFretSequence,
  } = useChromaticPractice();

  const { isPracticePlaying } = useNoteStore();

  const handleNodeClick = (node: ChromaticNote) => {
    console.log('Node clicked:', node);
  };

  const handleFingerPatternChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as number[];
    if (Array.isArray(value)) {
      dispatch({ type: 'SET_FINGER_PATTERN', payload: [...value] });
    }
  };

  const handleBeatTypeChange = (event: SelectChangeEvent<number>) => {
    dispatch({ type: 'SET_BEAT_TYPE', payload: event.target.value as number });
  };

  const handlePracticeModeChange = (event: SelectChangeEvent<PracticeMode>) => {
    dispatch({
      type: 'SET_PRACTICE_MODE',
      payload: event.target.value as PracticeMode,
    });
  };

  return (
    <Box sx={{ padding: 2, maxWidth: 'lg', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Chromatic Speed Practice (Looping)
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
          alignItems: 'flex-start',
        }}
      >
        <TextField
          label="BPM"
          type="number"
          value={state.bpm}
          onChange={(e) => {
            const val = e.target.value;
            handleBpmChange(val === '' ? '' : Number(val));
          }}
          onBlur={handleBpmBlur}
          sx={{ width: 100 }}
          inputProps={{
            min: MIN_BPM,
            max: MAX_BPM,
            step: 1,
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="beat-type-label">Beat Type</InputLabel>
          <Select<number>
            labelId="beat-type-label"
            value={state.beatType}
            label="Beat Type"
            onChange={handleBeatTypeChange}
          >
            <MenuItem value={4}>4 Beats</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180, mr: 2 }}>
          <InputLabel id="practice-mode-label">Practice Mode</InputLabel>
          <Select<PracticeMode>
            labelId="practice-mode-label"
            value={state.practiceMode}
            label="Practice Mode"
            onChange={handlePracticeModeChange}
          >
            <MenuItem value="loop">1번 프랫 반복</MenuItem>
            <MenuItem value="traverse_with_repeat">
              1번 프랫 반복(정방향/역방향)
            </MenuItem>
            <MenuItem value="traverse_6th_start">
              프랫 하행(6번줄 시작)
            </MenuItem>
            <MenuItem value="traverse_1st_start">
              프랫 하행(1번줄 시작)
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="finger-pattern-label">Finger Pattern</InputLabel>
          <Select<number[]>
            labelId="finger-pattern-label"
            multiple
            value={state.selectedFingerPattern}
            onChange={handleFingerPatternChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val, index) => (
                  <Chip key={`${val}-${index}`} label={String(val)} />
                ))}
              </Box>
            )}
            label="Finger Pattern"
            MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
          >
            {AVAILABLE_FINGER_NUMBERS.map((fingerNum) => (
              <MenuItem key={fingerNum} value={fingerNum}>
                {`Finger ${fingerNum}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={handleRandomFingerPattern}
          sx={{ height: 56 }}
        >
          Random
        </Button>

        <Button
          variant="contained"
          onClick={togglePractice}
          color={
            isPracticePlaying || state.isPreparingToPlay ? 'warning' : 'primary'
          }
          sx={{ height: 56 }}
        >
          {isPracticePlaying || state.isPreparingToPlay ? 'Stop' : 'Start'}
        </Button>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {state.isPreparingToPlay && state.countdown !== null && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h1"
              sx={{ color: 'white', fontWeight: 'bold', fontSize: '6rem' }}
            >
              {state.countdown > 0 ? state.countdown : 'GO!'}
            </Typography>
          </Box>
        )}
        <ChromaticFlatboard
          handleNodeClick={handleNodeClick}
          handleReset={() => resetToInitialPracticeState()}
          selectedFingerPattern={state.selectedFingerPattern}
          shouldReversePattern={state.shouldReversePattern}
          practiceMode={state.practiceMode}
        />
      </Box>
      <Typography sx={{ textAlign: 'center', mt: 1, minHeight: '1.5em' }}>
        {isPracticePlaying
          ? `Mode: ${state.practiceMode.replace(/_/g, ' ')} - String: ${state.currentLineNumber} (${state.practiceDirection === 'asc' ? 'Ascending' : 'Descending'}) - Pattern: ${state.selectedFingerPattern.join('-')} (Frets: ${selectedFretSequence.join('-')}) - Beat: ${state.beatType}/4`
          : `Stopped. Next start: Mode: ${state.practiceMode.replace(/_/g, ' ')} - String ${state.currentLineNumber} (Ascending) - Pattern: ${state.selectedFingerPattern.join('-')} (Frets: ${selectedFretSequence.join('-')}) - Beat: ${state.beatType}/4`}
      </Typography>

      <MetronomeEngine
        bpm={
          state.bpm === ''
            ? MIN_BPM
            : Math.max(MIN_BPM, Math.min(MAX_BPM, Number(state.bpm)))
        }
        beatType={state.beatType}
      />

      <Typography>
        {/* Display current state or logs here if needed */}
      </Typography>
    </Box>
  );
};

export default ChromaticPage;
