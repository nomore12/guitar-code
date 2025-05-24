import React, { useState, useEffect, useCallback } from 'react';
import ChromaticFlatboard from '../../components/fretboard/ChromaticFlatboard';
import Metronome from '../../components/metronome/Metronome3';
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

// Note 타입은 src/types/Note.d.ts 에 전역 선언되어 있다고 가정합니다.

const availableFrets = [1, 2, 3, 4];
const GUITAR_STRINGS = [6, 5, 4, 3, 2, 1]; // 줄 번호 배열 (6번줄이 위)

type PracticeDirection = 'asc' | 'desc';

const ChromaticPage: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [selectedFretSequence, setSelectedFretSequence] = useState<number[]>([
    1, 2, 3, 4,
  ]);
  const [practiceDirection, setPracticeDirection] =
    useState<PracticeDirection>('asc');
  const [currentLineNumber, setCurrentLineNumber] = useState<number>(
    GUITAR_STRINGS[0],
  ); // 기본 시작: 6번줄

  const {
    // practiceNotes, // 스토어의 practiceNotes (직접 사용하지 않음, 디버깅용 currentNoteIndex만 사용)
    currentNoteIndex,
    isPracticePlaying,
    setPracticeNotes,
    // clearPracticeNotes, // Reset 로직에서 직접 사용하지 않음
    setIsPracticePlaying,
    setOnMeasureEndCallback,
  } = useNoteStore();

  const generateAndSetPracticeNotes = useCallback(() => {
    console.log(
      `ChromaticPage: Generating notes for line ${currentLineNumber}, direction ${practiceDirection}`,
    );
    const newPracticeNotes: ChromaticNote[] = selectedFretSequence.map(
      (fretNumber, index) => ({
        flatNumber: fretNumber,
        lineNumber: currentLineNumber,
        chromaticNumber: index + 1,
        chord: String(index + 1),
      }),
    );
    setPracticeNotes(newPracticeNotes);
  }, [
    selectedFretSequence,
    currentLineNumber,
    practiceDirection,
    setPracticeNotes,
  ]);

  useEffect(() => {
    console.log(
      'ChromaticPage: Line, direction or fret sequence changed, regenerating notes.',
    );
    generateAndSetPracticeNotes();
  }, [
    currentLineNumber,
    practiceDirection,
    selectedFretSequence,
    generateAndSetPracticeNotes,
  ]);

  const handleNodeClick = (node: ChromaticNote) => {
    console.log('ChromaticFlatboard node clicked:', node);
  };

  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(event.target.value, 10);
    if (!isNaN(newBpm) && newBpm > 0 && newBpm <= 300) {
      setBpm(newBpm);
    }
  };

  const handleFretSequenceChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as number[];
    setSelectedFretSequence(Array.from(new Set(value)));
  };

  // 한 마디 종료 시 호출될 콜백 함수 (무한 루프 로직)
  const handleMeasureEnd = useCallback(() => {
    console.log(
      `ChromaticPage: Measure ended on line ${currentLineNumber}, direction: ${practiceDirection}`,
    );
    let nextLineNumber = currentLineNumber;
    let nextDirection = practiceDirection;

    if (practiceDirection === 'asc') {
      const currentLineStringIndex = GUITAR_STRINGS.indexOf(currentLineNumber);
      if (currentLineStringIndex < GUITAR_STRINGS.length - 1) {
        // 아직 마지막 줄(1번)이 아님
        nextLineNumber = GUITAR_STRINGS[currentLineStringIndex + 1];
      } else {
        // 1번 줄 (상행) 마침 -> 하행으로 전환, 줄은 그대로 1번
        console.log(
          'ChromaticPage: Ascending finished at 1st string. Switching to descending.',
        );
        nextDirection = 'desc';
        nextLineNumber = GUITAR_STRINGS[GUITAR_STRINGS.length - 1]; // 1번 줄에서 시작
      }
    } else {
      // practiceDirection === 'desc'
      const currentLineStringIndex = GUITAR_STRINGS.indexOf(currentLineNumber);
      if (currentLineStringIndex > 0) {
        // 아직 첫 줄(6번)이 아님
        nextLineNumber = GUITAR_STRINGS[currentLineStringIndex - 1];
      } else {
        // 6번 줄 (하행) 마침 -> 상행으로 전환, 줄은 그대로 6번
        console.log(
          'ChromaticPage: Descending finished at 6th string. Switching to ascending.',
        );
        nextDirection = 'asc';
        nextLineNumber = GUITAR_STRINGS[0]; // 6번 줄에서 시작
      }
    }

    // 상태 업데이트: setCurrentLineNumber 또는 setPracticeDirection이 먼저 호출되어도
    // useEffect는 모든 의존성 변경에 대해 한 번만 실행되도록 React가 보장 (배치 업데이트)
    if (currentLineNumber !== nextLineNumber) {
      setCurrentLineNumber(nextLineNumber);
    }
    if (practiceDirection !== nextDirection) {
      setPracticeDirection(nextDirection);
    }
    // 줄 또는 방향이 바뀌면 useEffect가 새 노트를 로드하고, isPracticePlaying은 유지됨.
  }, [
    currentLineNumber,
    practiceDirection,
    setCurrentLineNumber,
    setPracticeDirection,
  ]);

  useEffect(() => {
    if (setOnMeasureEndCallback) {
      setOnMeasureEndCallback(handleMeasureEnd);
    }
    return () => {
      if (setOnMeasureEndCallback) {
        setOnMeasureEndCallback(null);
      }
    };
  }, [setOnMeasureEndCallback, handleMeasureEnd]);

  const handleResetAndStop = () => {
    console.log('ChromaticPage: handleResetAndStop called.');
    setIsPracticePlaying(false); // 1. 연습 중지
    setPracticeDirection('asc'); // 2. 방향 초기화 (상행)
    setCurrentLineNumber(GUITAR_STRINGS[0]); // 3. 6번줄로 설정
    setSelectedFretSequence([1, 2, 3, 4]); // 4. 기본 프렛 패턴 설정
    // 위 상태 변경으로 인해 useEffect가 6번줄 기본 노트를 스토어에 자동 로드함.
    // useNoteStore의 setPracticeNotes는 currentNoteIndex를 0으로 리셋.
  };

  const togglePractice = () => {
    const wasPlaying = isPracticePlaying;
    setIsPracticePlaying(!wasPlaying);

    if (wasPlaying) {
      // 연습을 중지시키는 경우
      console.log(
        'ChromaticPage: Stopping practice. Resetting to 6th string, ascending.',
      );
      setPracticeDirection('asc');
      setCurrentLineNumber(GUITAR_STRINGS[0]);
      // selectedFretSequence는 유지. useEffect가 6번줄의 현재 선택된 프렛으로 노트를 로드.
      // 만약 노트가 없는 상태에서 Stop을 누르는 경우는 없으므로, generateAndSetPracticeNotes 불필요
    } else {
      // 연습을 시작하는 경우
      // 현재 currentLineNumber와 practiceDirection, selectedFretSequence로 노트 생성 및 연습 시작
      // 만약 이전에 노트가 없었다면 (예: 페이지 첫 로드 후 바로 Start)
      // generateAndSetPracticeNotes()가 useEffect에 의해 이미 호출되었거나 호출될 것임.
      // 또는, 명시적으로 여기서 한 번 더 호출해줄 수 있지만, 중복 가능성.
      // 현재 로직: isPracticePlaying이 true가 되면 Metronome이 시작되고, 스토어의 노트를 사용.
      // 노트가 이미 현재 줄/방향/패턴에 맞게 로드되어 있어야 함.
      // 이는 useEffect [currentLineNumber, practiceDirection, selectedFretSequence] 가 담당.
      console.log('ChromaticPage: Starting practice.');
      // 만약 스토어에 노트가 없는 극단적인 경우, 여기서 생성해줄 수 있음.
      const store = useNoteStore.getState();
      if (!store.practiceNotes || store.practiceNotes.length === 0) {
        console.log(
          'ChromaticPage: No notes in store when starting, generating...',
        );
        generateAndSetPracticeNotes();
      }
    }
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
          value={bpm}
          onChange={handleBpmChange}
          inputProps={{ min: 40, max: 300 }}
          sx={{ width: 100 }}
        />
        {/* 연습 방향 선택 UI 제거됨 */}
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="fret-sequence-label">Finger Pattern</InputLabel>
          <Select
            labelId="fret-sequence-label"
            multiple
            value={selectedFretSequence}
            onChange={handleFretSequenceChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((value) => (
                  <Chip key={value} label={String(value)} />
                ))}
              </Box>
            )}
            label="Finger Pattern (1st to 4th Fret)"
          >
            {availableFrets.map((fretNum) => (
              <MenuItem key={fretNum} value={fretNum}>
                {`Fret ${fretNum}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={togglePractice}
          color={isPracticePlaying ? 'warning' : 'primary'}
          sx={{ height: 56 }}
        >
          {isPracticePlaying ? 'Stop' : 'Start'}
        </Button>
      </Box>

      <ChromaticFlatboard
        handleNodeClick={handleNodeClick}
        handleReset={handleResetAndStop}
      />
      <Typography sx={{ textAlign: 'center', mt: 1, minHeight: '1.5em' }}>
        {isPracticePlaying
          ? `Current String: ${currentLineNumber} (${practiceDirection === 'asc' ? 'Ascending' : 'Descending'})`
          : `Stopped. Next start: String ${currentLineNumber} (Ascending)`}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Metronome bpm={bpm} />
      </Box>
      <Typography>
        Current Store Index (for debugging): {currentNoteIndex}
      </Typography>
    </Box>
  );
};

export default ChromaticPage;
