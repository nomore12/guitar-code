import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChromaticFlatboard from '../../components/fretboard/ChromaticFlatboard';
// import Metronome from '../../components/metronome/Metronome3'; // 이전 메트로놈 주석 처리
import MetronomeEngine from '../../components/metronome/MetronomeEngine'; // 파일 이름 변경 반영
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
const availableBeatTypes = [4]; // Beat Type을 4 하나만 포함하도록 수정

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
  const [beatType, setBeatType] = useState<number>(4); // 기본값 4 유지
  const practiceStartTimerRef = useRef<NodeJS.Timeout | null>(null); // 타이머 ID 저장용 ref

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

  const handleBeatTypeChange = (event: SelectChangeEvent<number>) => {
    const newBeatType = event.target.value as number;
    setBeatType(newBeatType);
    if (isPracticePlaying) {
      // 재생 중에 박자가 바뀌면 일단 정지시켰다가 다시 시작하는게 안전할 수 있음
      // setIsPracticePlaying(false); // 또는 MetronomeEngine이 beatType 변경을 감지하고 스스로 재시작하도록 둘 수도 있음
      // 현재 MetronomeEngine은 beatType을 useEffect 의존성에 포함하므로, 자동으로 루프를 재설정함.
      console.log(
        'ChromaticPage: Beat type changed. MetronomeEngine will re-initialize.',
      );
    }
  };

  // 한 마디 종료 시 호출될 콜백 함수 (무한 루프 로직, 중복 연주 방지)
  const handleMeasureEnd = useCallback(() => {
    console.log(
      `ChromaticPage: Measure ended on line ${currentLineNumber}, direction: ${practiceDirection}`,
    );
    let nextLineNumber = currentLineNumber;
    let nextDirection = practiceDirection;
    let directionJustSwitched = false;

    if (practiceDirection === 'asc') {
      const currentLineStringIndex = GUITAR_STRINGS.indexOf(currentLineNumber);
      if (currentLineStringIndex < GUITAR_STRINGS.length - 1) {
        // 아직 마지막 줄(1번)이 아님
        nextLineNumber = GUITAR_STRINGS[currentLineStringIndex + 1];
      } else {
        // 1번 줄 (상행) 마침 -> 2번 줄 하행으로 전환
        console.log(
          'ChromaticPage: Ascending finished at 1st string. Switching to descending on 2nd string.',
        );
        nextDirection = 'desc';
        // 1번 줄에서 상행이 끝났으므로 다음은 2번 줄에서 하행 시작
        if (GUITAR_STRINGS.length > 1) {
          // 줄이 2개 이상 있을 때만 의미 있음
          nextLineNumber = GUITAR_STRINGS[GUITAR_STRINGS.length - 2]; // 2번 줄
        } else {
          // 줄이 하나뿐이면 방향만 바꾸고 줄은 그대로 (이 경우 루프가 의미 없어지지만 방어 코드)
          nextLineNumber = GUITAR_STRINGS[GUITAR_STRINGS.length - 1];
        }
        directionJustSwitched = true;
      }
    } else {
      // practiceDirection === 'desc'
      const currentLineStringIndex = GUITAR_STRINGS.indexOf(currentLineNumber);
      if (currentLineStringIndex > 0) {
        // 아직 첫 줄(6번)이 아님
        nextLineNumber = GUITAR_STRINGS[currentLineStringIndex - 1];
      } else {
        // 6번 줄 (하행) 마침 -> 5번 줄 상행으로 전환
        console.log(
          'ChromaticPage: Descending finished at 6th string. Switching to ascending on 5th string.',
        );
        nextDirection = 'asc';
        // 6번 줄에서 하행이 끝났으므로 다음은 5번 줄에서 상행 시작
        if (GUITAR_STRINGS.length > 1) {
          // 줄이 2개 이상 있을 때만 의미 있음
          nextLineNumber = GUITAR_STRINGS[1]; // 5번 줄
        } else {
          nextLineNumber = GUITAR_STRINGS[0];
        }
        directionJustSwitched = true;
      }
    }

    if (currentLineNumber !== nextLineNumber) {
      setCurrentLineNumber(nextLineNumber);
    }
    if (practiceDirection !== nextDirection) {
      setPracticeDirection(nextDirection);
    }
    // 줄 또는 방향이 바뀌면 useEffect가 새 노트를 로드하고, isPracticePlaying은 유지됨.
    // 만약 방향만 바뀌고 줄은 그대로인 경우 (예: GUITAR_STRINGS.length === 1 일 때의 극단적 상황)
    // 또는 방향과 줄이 모두 바뀌는 경우 모두 useEffect가 처리.
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
    if (practiceStartTimerRef.current) {
      // 리셋 시 지연 시작 타이머가 있다면 취소
      clearTimeout(practiceStartTimerRef.current);
      practiceStartTimerRef.current = null;
    }
    setIsPracticePlaying(false);
    setPracticeDirection('asc');
    setCurrentLineNumber(GUITAR_STRINGS[0]);
    setSelectedFretSequence([1, 2, 3, 4]);
    setBeatType(4);
  };

  const togglePractice = () => {
    const wasPlaying = isPracticePlaying;

    // 기존 타이머가 있다면 취소 (연속 클릭 방지 및 상태 변경 시 정리)
    if (practiceStartTimerRef.current) {
      clearTimeout(practiceStartTimerRef.current);
      practiceStartTimerRef.current = null;
    }

    if (wasPlaying) {
      // 연습을 중지시키는 경우
      setIsPracticePlaying(false); // 즉시 중지
      console.log(
        'ChromaticPage: Stopping practice. Resetting to 6th string, ascending.',
      );
      setPracticeDirection('asc');
      setCurrentLineNumber(GUITAR_STRINGS[0]);
    } else {
      // 연습을 시작하는 경우
      console.log(
        'ChromaticPage: Attempting to start practice in 2 seconds...',
      );
      // 먼저 노트가 준비되었는지 확인하고 생성 (만약 없다면)
      const store = useNoteStore.getState();
      if (!store.practiceNotes || store.practiceNotes.length === 0) {
        console.log(
          'ChromaticPage: No notes in store when starting, generating...',
        );
        generateAndSetPracticeNotes(); // 동기적으로 노트 먼저 생성
      }

      // 2초 후 연습 시작
      practiceStartTimerRef.current = setTimeout(() => {
        console.log('ChromaticPage: Starting practice now (after 2s delay).');
        setIsPracticePlaying(true);
        practiceStartTimerRef.current = null; // 타이머 실행 후 ID 초기화
      }, 2000);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (practiceStartTimerRef.current) {
        clearTimeout(practiceStartTimerRef.current);
      }
    };
  }, []); // 빈 의존성 배열로 마운트/언마운트 시 한 번만 실행

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
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="beat-type-label">Beat Type</InputLabel>
          <Select<number> // Select의 value 타입 명시
            labelId="beat-type-label"
            value={beatType}
            label="Beat Type"
            onChange={handleBeatTypeChange}
          >
            <MenuItem value={4}>4 Beats</MenuItem>
          </Select>
        </FormControl>
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
          ? `Current String: ${currentLineNumber} (${practiceDirection === 'asc' ? 'Ascending' : 'Descending'}) - Beat: ${beatType}/4`
          : `Stopped. Next start: String ${currentLineNumber} (Ascending) - Beat: ${beatType}/4`}
      </Typography>
      {/* MetronomeEngine을 렌더링하지만 보이지 않게 처리 (또는 DOM에서 완전히 제거하고 커스텀 훅 등으로 관리) */}
      {/* <Box sx={{ display: 'none' }}> */}
      <MetronomeEngine bpm={bpm} beatType={beatType} />
      {/* </Box> */}
      {/* 위 MetronomeEngine을 Box로 감싸서 display:none 처리하거나, 아예 렌더링 트리에서 제외하는 방법도 고려 */}
      {/* 여기서는 일단 보이도록 두되, 실제로는 숨김 처리 또는 로직만 실행되도록 해야 함 */}
      <Typography>
        Current Store Index (for debugging): {currentNoteIndex}
      </Typography>
    </Box>
  );
};

export default ChromaticPage;
