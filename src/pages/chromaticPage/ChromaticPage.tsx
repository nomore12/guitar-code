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

// 연습 모드 타입 정의
type PracticeMode = 'loop' | 'traverse_6th_start' | 'traverse_1st_start';

// 프렛 이동 방향 타입 정의
type FretTraversalDirection = 'increasing' | 'decreasing' | 'done';

const AVAILABLE_FRETS_FOR_LOOP_MODE = [1, 2, 3, 4]; // 루프 모드에서 사용자가 선택 가능한 프렛
const GUITAR_STRINGS = [6, 5, 4, 3, 2, 1]; // 줄 번호 배열 (6번줄이 위)
const availableBeatTypes = [4]; // Beat Type을 4 하나만 포함하도록 수정
const MAX_FRET_OFFSET = 8; // 9-12번 프렛 (1-4 프렛 기준, 0부터 시작하는 offset이므로 12-4 = 8)
const DEFAULT_FRET_SEQUENCE_LENGTH = 4; // 한 번에 연습하는 프렛 구간의 길이

type PracticeDirection = 'asc' | 'desc';

const ChromaticPage: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  // selectedFretSequence는 traverse 모드에서는 동적으로, loop 모드에서는 사용자가 설정
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

  // 새로운 연습 모드 관련 상태
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('loop');
  const [currentFretOffset, setCurrentFretOffset] = useState<number>(0); // traverse 모드용: 0 ~ MAX_FRET_OFFSET
  const [fretTraversalDirection, setFretTraversalDirection] =
    useState<FretTraversalDirection>('increasing'); // traverse 모드용
  const [isPreparingToPlay, setIsPreparingToPlay] = useState<boolean>(false); // 2초 대기 상태

  const {
    // practiceNotes, // 스토어의 practiceNotes (직접 사용하지 않음, 디버깅용 currentNoteIndex만 사용)
    currentNoteIndex,
    isPracticePlaying,
    setPracticeNotes,
    // clearPracticeNotes, // Reset 로직에서 직접 사용하지 않음
    setIsPracticePlaying,
    setOnMeasureEndCallback,
  } = useNoteStore();

  // traverse 모드일 때 currentFretOffset이 변경되면 selectedFretSequence를 업데이트
  useEffect(() => {
    if (practiceMode.startsWith('traverse')) {
      const newSequence = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + currentFretOffset,
      );
      setSelectedFretSequence(newSequence);
    }
    // loop 모드일 때는 사용자가 직접 설정하므로, 여기서는 변경하지 않음
    // (또는 loop 모드로 전환될 때 기본값으로 리셋할 수 있음. 예: [1,2,3,4])
  }, [practiceMode, currentFretOffset]);

  // 연습 상태를 초기 설정으로 리셋하는 함수
  // handleMeasureEnd보다 먼저 선언되어야 함
  const resetToInitialPracticeState = useCallback(
    (modeToResetTo: PracticeMode) => {
      console.log(
        `ChromaticPage: Resetting practice state for mode: ${modeToResetTo}`,
      );
      if (practiceStartTimerRef.current) {
        clearTimeout(practiceStartTimerRef.current);
        practiceStartTimerRef.current = null;
      }
      setIsPreparingToPlay(false);
      setIsPracticePlaying(false);

      setCurrentFretOffset(0);
      setFretTraversalDirection('increasing');

      if (modeToResetTo === 'loop') {
        setSelectedFretSequence(AVAILABLE_FRETS_FOR_LOOP_MODE);
        setCurrentLineNumber(GUITAR_STRINGS[0]);
        setPracticeDirection('asc');
      } else if (modeToResetTo === 'traverse_6th_start') {
        setCurrentLineNumber(GUITAR_STRINGS[0]);
        setPracticeDirection('asc');
        const initialTraverseSequence = Array.from(
          { length: DEFAULT_FRET_SEQUENCE_LENGTH },
          (_, i) => i + 1 + 0,
        );
        setSelectedFretSequence(initialTraverseSequence);
      } else if (modeToResetTo === 'traverse_1st_start') {
        setCurrentLineNumber(GUITAR_STRINGS[GUITAR_STRINGS.length - 1]);
        setPracticeDirection('desc');
        const initialTraverseSequence = Array.from(
          { length: DEFAULT_FRET_SEQUENCE_LENGTH },
          (_, i) => i + 1 + 0,
        );
        setSelectedFretSequence(initialTraverseSequence);
      }
    },
    [
      setIsPracticePlaying,
      setCurrentFretOffset,
      setFretTraversalDirection,
      setSelectedFretSequence,
      setCurrentLineNumber,
      setPracticeDirection,
    ],
  ); // 의존성 추가

  // 음표 배열을 생성하는 순수 헬퍼 함수
  const generateChromaticNotesArray = (
    line: number,
    sequence: number[], // direction 파라미터 제거 (현재 사용 안 함)
  ): ChromaticNote[] => {
    return sequence.map((fretNumber, index) => ({
      flatNumber: fretNumber,
      lineNumber: line,
      chromaticNumber: index + 1,
      chord: String(index + 1),
    }));
  };

  const generateAndSetPracticeNotes = useCallback(() => {
    let sequenceToUse = selectedFretSequence;
    if (practiceMode.startsWith('traverse')) {
      sequenceToUse = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + currentFretOffset,
      );
    }
    console.log(
      `ChromaticPage: Generating notes (useCallback) for line ${currentLineNumber}, direction ${practiceDirection}, mode: ${practiceMode}, offset: ${currentFretOffset}, sequence: ${sequenceToUse.join(',')}`,
    );
    const newPracticeNotes = generateChromaticNotesArray(
      currentLineNumber,
      sequenceToUse,
    );
    setPracticeNotes(newPracticeNotes);
  }, [
    selectedFretSequence,
    currentLineNumber,
    practiceDirection,
    setPracticeNotes,
    practiceMode,
    currentFretOffset,
  ]);

  useEffect(() => {
    // 이 useEffect는 주로 사용자 인터랙션(모드 변경, 프렛 패턴 변경 등)이나
    // traverse 모드에서의 offset 변경 시 노트를 업데이트하는 역할을 합니다.
    // handleMeasureEnd에서의 노트 업데이트는 직접 setPracticeNotes를 호출하여 더 즉각적으로 반응합니다.
    console.log(
      'ChromaticPage: useEffect[line,dir,seq] triggered, regenerating notes if necessary.',
    );
    generateAndSetPracticeNotes();
  }, [
    currentLineNumber, // handleMeasureEnd에서 상태 변경 후 이 useEffect도 호출됨
    practiceDirection, // handleMeasureEnd에서 상태 변경 후 이 useEffect도 호출됨
    selectedFretSequence, // 사용자가 루프 모드에서 패턴 변경 시 또는 트래버스에서 오프셋 변경 시
    generateAndSetPracticeNotes, // useCallback이므로 안정적
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

  // 연습 모드 변경 핸들러
  const handlePracticeModeChange = (event: SelectChangeEvent<PracticeMode>) => {
    const newMode = event.target.value as PracticeMode;
    console.log(`ChromaticPage: Practice mode changed to ${newMode}`);
    setPracticeMode(newMode);

    setIsPracticePlaying(false);
    if (practiceStartTimerRef.current) {
      clearTimeout(practiceStartTimerRef.current);
      practiceStartTimerRef.current = null;
    }

    setCurrentFretOffset(0);
    setFretTraversalDirection('increasing');

    if (newMode === 'loop') {
      setSelectedFretSequence(AVAILABLE_FRETS_FOR_LOOP_MODE);
      setCurrentLineNumber(GUITAR_STRINGS[0]);
      setPracticeDirection('asc');
    } else if (newMode === 'traverse_6th_start') {
      setCurrentLineNumber(GUITAR_STRINGS[0]); // 6번줄
      setPracticeDirection('asc'); // 상행 시작
      // selectedFretSequence는 useEffect에 의해 자동 설정
    } else if (newMode === 'traverse_1st_start') {
      setCurrentLineNumber(GUITAR_STRINGS[GUITAR_STRINGS.length - 1]); // 1번줄
      setPracticeDirection('desc'); // 하행 시작
      // selectedFretSequence는 useEffect에 의해 자동 설정
    }
  };

  const handleMeasureEnd = useCallback(() => {
    if (!isPracticePlaying) return;

    const originalLineNumber = currentLineNumber;
    const originalPracticeDirection = practiceDirection;
    const originalFretOffset = currentFretOffset;
    const originalSelectedFretSequence = selectedFretSequence;

    let nextLine = originalLineNumber;
    let nextDir = originalPracticeDirection;
    let nextFretOff = originalFretOffset;
    let nextFretTravDir = fretTraversalDirection;
    let stopPractice = false;

    console.log(
      `ChromaticPage: handleMeasureEnd CALLED. Current: L=${originalLineNumber}, D=${originalPracticeDirection}, M=${practiceMode}, FO=${originalFretOffset}, FTD=${fretTraversalDirection}`,
    );

    const currentLineIdx = GUITAR_STRINGS.indexOf(originalLineNumber);

    if (practiceMode === 'loop') {
      if (originalPracticeDirection === 'asc') {
        if (currentLineIdx < GUITAR_STRINGS.length - 1) {
          nextLine = GUITAR_STRINGS[currentLineIdx + 1];
        } else {
          // 1번 줄 도달
          nextDir = 'desc';
        }
      } else {
        // desc
        if (currentLineIdx > 0) {
          nextLine = GUITAR_STRINGS[currentLineIdx - 1];
        } else {
          // 6번 줄 도달
          nextDir = 'asc';
        }
      }

      if (
        originalLineNumber !== nextLine ||
        originalPracticeDirection !== nextDir
      ) {
        console.log(
          `Loop: State change. New L=${nextLine}, D=${nextDir}. Old L=${originalLineNumber}, D=${originalPracticeDirection}`,
        );
        const newNotes = generateChromaticNotesArray(
          nextLine,
          originalSelectedFretSequence,
        );
        setPracticeNotes(newNotes);
        if (currentLineNumber !== nextLine) setCurrentLineNumber(nextLine);
        if (practiceDirection !== nextDir) setPracticeDirection(nextDir);
      }
    } else if (practiceMode.startsWith('traverse')) {
      let tempNextLine = originalLineNumber;
      let tempNextDir = originalPracticeDirection;
      let tempNextFretOffset = originalFretOffset;
      let tempNextFretTravDir = fretTraversalDirection;
      let tempStopPractice = false;

      if (fretTraversalDirection === 'increasing') {
        if (practiceDirection === 'asc') {
          if (currentLineIdx < GUITAR_STRINGS.length - 1) {
            tempNextLine = GUITAR_STRINGS[currentLineIdx + 1];
          } else {
            if (originalFretOffset < MAX_FRET_OFFSET) {
              tempNextFretOffset = originalFretOffset + 1;
              tempNextLine = GUITAR_STRINGS[GUITAR_STRINGS.length - 1];
              tempNextDir = 'desc';
            } else {
              tempNextFretTravDir = 'decreasing';
              tempNextFretOffset = originalFretOffset - 1;
              tempNextLine = GUITAR_STRINGS[GUITAR_STRINGS.length - 1];
              tempNextDir = 'desc';
            }
          }
        } else {
          // practiceDirection === 'desc'
          if (currentLineIdx > 0) {
            tempNextLine = GUITAR_STRINGS[currentLineIdx - 1];
          } else {
            if (originalFretOffset < MAX_FRET_OFFSET) {
              tempNextFretOffset = originalFretOffset + 1;
              tempNextLine = GUITAR_STRINGS[0];
              tempNextDir = 'asc';
            } else {
              if (practiceMode === 'traverse_1st_start') {
                tempNextFretTravDir = 'decreasing';
                tempNextFretOffset = originalFretOffset - 1;
                tempNextLine = GUITAR_STRINGS[0];
                tempNextDir = 'asc';
              } else {
                tempNextLine = GUITAR_STRINGS[0];
                tempNextDir = 'asc';
              }
            }
          }
        }
      } else if (fretTraversalDirection === 'decreasing') {
        if (practiceDirection === 'desc') {
          if (currentLineIdx > 0) {
            tempNextLine = GUITAR_STRINGS[currentLineIdx - 1];
          } else {
            if (originalFretOffset > 0) {
              tempNextFretOffset = originalFretOffset - 1;
              tempNextLine = GUITAR_STRINGS[0];
              tempNextDir = 'asc';
            } else {
              tempStopPractice = true;
              tempNextFretTravDir = 'done';
            }
          }
        } else {
          // practiceDirection === 'asc'
          if (currentLineIdx < GUITAR_STRINGS.length - 1) {
            tempNextLine = GUITAR_STRINGS[currentLineIdx + 1];
          } else {
            if (originalFretOffset > 0) {
              tempNextFretOffset = originalFretOffset - 1;
              tempNextLine = GUITAR_STRINGS[GUITAR_STRINGS.length - 1];
              tempNextDir = 'desc';
            } else {
              tempStopPractice = true;
              tempNextFretTravDir = 'done';
            }
          }
        }
      }

      nextLine = tempNextLine;
      nextDir = tempNextDir;
      nextFretOff = tempNextFretOffset;
      nextFretTravDir = tempNextFretTravDir;
      stopPractice = tempStopPractice;

      const nextFretSequenceNumbers = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + nextFretOff,
      );
      const currentTraverseFretSequenceNumbers = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + originalFretOffset,
      );

      let notesShouldChangeForTraverse = false;
      if (
        originalLineNumber !== nextLine ||
        originalPracticeDirection !== nextDir ||
        originalFretOffset !== nextFretOff || // Fret offset 변경도 노트 변경 유발
        currentTraverseFretSequenceNumbers.join('-') !==
          nextFretSequenceNumbers.join('-')
      ) {
        notesShouldChangeForTraverse = true;
      }

      if (notesShouldChangeForTraverse) {
        console.log(
          `Traverse: State change. New L=${nextLine}, D=${nextDir}, FO=${nextFretOff}`,
        );
        const newNotes = generateChromaticNotesArray(
          nextLine,
          nextFretSequenceNumbers,
        );
        setPracticeNotes(newNotes);
      }
      // Traverse 모드의 React 상태 업데이트는 아래 공통 블록에서 처리
    }

    if (stopPractice) {
      setIsPracticePlaying(false);
      if (nextFretTravDir === 'done') {
        resetToInitialPracticeState(practiceMode);
      }
    } else {
      // 공통 React 상태 업데이트 (Loop 모드는 위에서 이미 처리됨)
      if (practiceMode.startsWith('traverse')) {
        if (currentLineNumber !== nextLine) setCurrentLineNumber(nextLine);
        if (practiceDirection !== nextDir) setPracticeDirection(nextDir);
        if (currentFretOffset !== nextFretOff)
          setCurrentFretOffset(nextFretOff);
        if (fretTraversalDirection !== nextFretTravDir)
          setFretTraversalDirection(nextFretTravDir);
      }
    }
  }, [
    isPracticePlaying,
    practiceMode,
    currentLineNumber,
    practiceDirection,
    selectedFretSequence, // originalSelectedFretSequence를 위해 필요
    currentFretOffset,
    fretTraversalDirection,
    setPracticeNotes,
    setIsPracticePlaying,
    setCurrentLineNumber,
    setPracticeDirection,
    setCurrentFretOffset,
    setFretTraversalDirection,
    resetToInitialPracticeState,
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
    resetToInitialPracticeState(practiceMode); // 현재 모드의 초기 상태로 리셋
  };

  const togglePractice = () => {
    const storeIsPlaying = useNoteStore.getState().isPracticePlaying;

    if (practiceStartTimerRef.current) {
      clearTimeout(practiceStartTimerRef.current);
      practiceStartTimerRef.current = null;
    }

    if (storeIsPlaying || isPreparingToPlay) {
      // 연습을 중지시키는 경우 (Stop 버튼 클릭 또는 준비 중 취소)
      console.log(
        'ChromaticPage: Stopping/Cancelling practice. Resetting to initial state.',
      );
      setIsPreparingToPlay(false); // 준비 상태 해제
      // setIsPracticePlaying(false); // resetToInitialPracticeState 내부에서 isPracticePlaying: false 처리 및 스토어 업데이트
      resetToInitialPracticeState(practiceMode);
    } else {
      // 연습을 시작하는 경우 (Start 버튼 클릭)
      console.log(
        'ChromaticPage: Start button clicked. Preparing to start in 2s...',
      );
      setIsPreparingToPlay(true); // UI를 즉시 변경하기 위해 준비 상태로 설정

      // 노트가 준비되었는지 확인하고 생성 (만약 없다면)
      const store = useNoteStore.getState();
      if (!store.practiceNotes || store.practiceNotes.length === 0) {
        console.log(
          'ChromaticPage: No notes in store when starting, generating...',
        );
        generateAndSetPracticeNotes();
      }
      useNoteStore.getState().setCurrentNoteIndex(0);

      practiceStartTimerRef.current = setTimeout(() => {
        setIsPreparingToPlay(false); // 준비 상태 해제
        // 2초 후 실제 연습 시작: 스토어의 isPracticePlaying을 true로 설정
        // 이 시점에 isPracticePlaying이 false여야만 시작 (Stop으로 중간에 취소되지 않은 경우)
        if (!useNoteStore.getState().isPracticePlaying) {
          console.log(
            'ChromaticPage: 2s delay over. Starting practice now by setting store state.',
          );
          setIsPracticePlaying(true); // 스토어 상태 변경 -> MetronomeEngine 등 반응
        } else {
          console.log(
            'ChromaticPage: 2s delay over, but practice was already stopped/cancelled.',
          );
        }
        practiceStartTimerRef.current = null;
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

        {/* 연습 모드 선택 드롭다운 */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="practice-mode-label">Practice Mode</InputLabel>
          <Select<PracticeMode>
            labelId="practice-mode-label"
            value={practiceMode}
            label="Practice Mode"
            onChange={handlePracticeModeChange}
          >
            <MenuItem value="loop">Loop Current Frets</MenuItem>
            <MenuItem value="traverse_6th_start">
              Traverse 6th String Start
            </MenuItem>
            <MenuItem value="traverse_1st_start">
              Traverse 1st String Start
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="fret-sequence-label">
            {practiceMode === 'loop' ? 'Finger Pattern' : 'Current Fret Range'}
          </InputLabel>
          <Select
            labelId="fret-sequence-label"
            multiple
            value={selectedFretSequence}
            onChange={handleFretSequenceChange}
            disabled={practiceMode.startsWith('traverse')} // Traverse 모드에서는 비활성화
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((value) => (
                  <Chip key={value} label={String(value)} />
                ))}
              </Box>
            )}
            label={
              practiceMode === 'loop'
                ? 'Finger Pattern (1st to 4th Fret)'
                : 'Current Fret Range'
            }
          >
            {AVAILABLE_FRETS_FOR_LOOP_MODE.map((fretNum) => (
              <MenuItem key={fretNum} value={fretNum}>
                {`Fret ${fretNum}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={togglePractice}
          color={
            useNoteStore.getState().isPracticePlaying || isPreparingToPlay
              ? 'warning'
              : 'primary'
          }
          sx={{ height: 56 }}
        >
          {useNoteStore.getState().isPracticePlaying || isPreparingToPlay
            ? 'Stop'
            : 'Start'}
        </Button>
      </Box>

      <ChromaticFlatboard
        handleNodeClick={handleNodeClick}
        handleReset={handleResetAndStop}
      />
      <Typography sx={{ textAlign: 'center', mt: 1, minHeight: '1.5em' }}>
        {isPracticePlaying
          ? `Mode: ${practiceMode.replace('_', ' ')} - String: ${currentLineNumber} (${practiceDirection === 'asc' ? 'Ascending' : 'Descending'}) - Frets: ${selectedFretSequence.join('-')} - Beat: ${beatType}/4`
          : `Stopped. Next start: Mode: ${practiceMode.replace('_', ' ')} - String ${currentLineNumber} (Ascending) - Frets: ${selectedFretSequence.join('-')} - Beat: ${beatType}/4`}
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
