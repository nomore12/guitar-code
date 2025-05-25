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

// 모드별 핸들러 함수의 반환 타입을 정의합니다.
interface ModeEndResult {
  nextLineNumber?: number;
  nextPracticeDirection?: PracticeDirection;
  nextFretOffset?: number;
  nextFretTraversalDirection?: FretTraversalDirection;
  shouldStopPractice?: boolean;
}

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

  // This useEffect updates selectedFretSequence for traverse modes when offset changes.
  // It does NOT generate notes directly.
  useEffect(() => {
    if (practiceMode.startsWith('traverse')) {
      const newSequence = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + currentFretOffset,
      );
      setSelectedFretSequence(newSequence);
    }
  }, [practiceMode, currentFretOffset]); // setSelectedFretSequence is not in deps

  const generateChromaticNotesArray = useCallback(
    (line: number, sequence: number[]): ChromaticNote[] => {
      return sequence.map((fretNumber, index) => ({
        flatNumber: fretNumber,
        lineNumber: line,
        chromaticNumber: index + 1,
        chord: String(index + 1),
      }));
    },
    [],
  );

  const generateAndSetPracticeNotes = useCallback(() => {
    let sequenceToUse = selectedFretSequence;
    // For traverse modes, the sequence is dynamic based on currentFretOffset
    // The useEffect above should have updated selectedFretSequence if currentFretOffset changed for traverse mode.
    // However, to be absolutely sure, especially if called outside traverse mode context or if useEffect didn't run yet for some reason:
    if (practiceMode.startsWith('traverse')) {
      sequenceToUse = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + currentFretOffset,
      );
    }

    console.log(
      `[DEBUG] generateAndSetPracticeNotes CALLED. Line: ${currentLineNumber}, Direction: ${practiceDirection}, Mode: ${practiceMode}, FretOffset: ${currentFretOffset}, Sequence: ${sequenceToUse.join(',')}`,
    );
    const newPracticeNotes = generateChromaticNotesArray(
      currentLineNumber,
      sequenceToUse,
    );
    console.log(
      `[DEBUG] setPracticeNotes WILL BE CALLED with ${newPracticeNotes.length} notes. First note: ${newPracticeNotes.length > 0 ? JSON.stringify(newPracticeNotes[0]) : 'N/A'}`,
    );
    setPracticeNotes(newPracticeNotes);
  }, [
    selectedFretSequence,
    currentLineNumber,
    practiceDirection,
    setPracticeNotes,
    practiceMode,
    currentFretOffset,
    generateChromaticNotesArray,
  ]);

  const resetToInitialPracticeState = useCallback(
    (modeToResetTo: PracticeMode) => {
      console.log(
        `[DEBUG] resetToInitialPracticeState called for mode: ${modeToResetTo}`,
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
        const initialTraverseSequence = Array.from(
          { length: DEFAULT_FRET_SEQUENCE_LENGTH },
          (_, i) => i + 1 + 0, // offset 0
        );
        setSelectedFretSequence(initialTraverseSequence);
        setCurrentLineNumber(GUITAR_STRINGS[0]);
        setPracticeDirection('asc');
      } else if (modeToResetTo === 'traverse_1st_start') {
        const initialTraverseSequence = Array.from(
          { length: DEFAULT_FRET_SEQUENCE_LENGTH },
          (_, i) => i + 1 + 0, // offset 0
        );
        setSelectedFretSequence(initialTraverseSequence);
        setCurrentLineNumber(GUITAR_STRINGS[GUITAR_STRINGS.length - 1]);
        setPracticeDirection('desc');
      }
      generateAndSetPracticeNotes();
    },
    [
      setIsPracticePlaying,
      setCurrentFretOffset,
      setFretTraversalDirection,
      setSelectedFretSequence,
      setCurrentLineNumber,
      setPracticeDirection,
      generateAndSetPracticeNotes,
    ],
  );

  const handleNodeClick = (node: ChromaticNote) => {
    // No console log needed here for now
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
    generateAndSetPracticeNotes();
  };

  const handleBeatTypeChange = (event: SelectChangeEvent<number>) => {
    const newBeatType = event.target.value as number;
    setBeatType(newBeatType);
  };

  const handlePracticeModeChange = (event: SelectChangeEvent<PracticeMode>) => {
    const newMode = event.target.value as PracticeMode;
    console.log(`[DEBUG] handlePracticeModeChange to ${newMode}`);
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
      const initialTraverseSequence = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + 0, // offset 0
      );
      setSelectedFretSequence(initialTraverseSequence); // This will be used by generateAndSetPracticeNotes
      setCurrentLineNumber(GUITAR_STRINGS[0]);
      setPracticeDirection('asc');
    } else if (newMode === 'traverse_1st_start') {
      const initialTraverseSequence = Array.from(
        { length: DEFAULT_FRET_SEQUENCE_LENGTH },
        (_, i) => i + 1 + 0, // offset 0
      );
      setSelectedFretSequence(initialTraverseSequence); // This will be used by generateAndSetPracticeNotes
      setCurrentLineNumber(GUITAR_STRINGS[GUITAR_STRINGS.length - 1]);
      setPracticeDirection('desc');
    }
    generateAndSetPracticeNotes();
  };

  const handleLoopModeEnd = useCallback(
    (
      currentLine: number,
      currentDirection: PracticeDirection,
    ): ModeEndResult => {
      console.log(
        `[DEBUG] handleLoopModeEnd CALLED. Current Line: ${currentLine}, Direction: ${currentDirection}`,
      );
      let nextLine = currentLine;
      let nextDir = currentDirection;
      const currentLineIdx = GUITAR_STRINGS.indexOf(currentLine);

      if (currentDirection === 'asc') {
        if (currentLineIdx < GUITAR_STRINGS.length - 1) {
          nextLine = GUITAR_STRINGS[currentLineIdx + 1];
        } else {
          // 1번 줄 상행 완료
          nextDir = 'desc';
          // nextLine은 그대로 1번 줄
        }
      } else {
        // currentDirection === 'desc'
        if (currentLineIdx > 0) {
          nextLine = GUITAR_STRINGS[currentLineIdx - 1];
        } else {
          // 6번 줄 하행 완료
          nextDir = 'asc';
          // nextLine은 그대로 6번 줄
        }
      }
      const result = {
        nextLineNumber: nextLine,
        nextPracticeDirection: nextDir,
      };
      console.log('[DEBUG] handleLoopModeEnd RETURNING:', result);
      return result;
    },
    [],
  );

  const handleTraverseModeEnd = useCallback(
    (
      currentLine: number,
      currentDirection: PracticeDirection,
      currentOffset: number,
      currentFretDir: FretTraversalDirection,
      mode: PracticeMode,
    ): ModeEndResult => {
      console.log(
        `[DEBUG] handleTraverseModeEnd CALLED. Line: ${currentLine}, Direction: ${currentDirection}, FretOffset: ${currentOffset}, FretTraversalDirection: ${currentFretDir}, Mode: ${mode}`,
      );
      let nextLineNum = currentLine;
      let nextPracDir = currentDirection;
      let nextFretOff = currentOffset;
      let nextFretTravDir = currentFretDir;
      let stopPractice = false;

      const currentLineIdx = GUITAR_STRINGS.indexOf(currentLine);

      if (currentFretDir === 'increasing') {
        if (currentDirection === 'asc') {
          // 상행 중
          if (currentLineIdx < GUITAR_STRINGS.length - 1) {
            // 현재 줄이 1번 줄이 아니면
            nextLineNum = GUITAR_STRINGS[currentLineIdx + 1]; // 다음 줄로 (1번 줄 방향으로)
          } else {
            // 1번 줄 상행 완료
            if (currentOffset < MAX_FRET_OFFSET) {
              // 아직 최대 프렛이 아니면
              nextFretOff = currentOffset + 1; // 다음 프렛으로
              nextLineNum = GUITAR_STRINGS[GUITAR_STRINGS.length - 1]; // 1번 줄에서 하행 시작
              nextPracDir = 'desc';
            } else {
              // 최대 프렛(9-12)에서 1번 줄 상행 완료
              // 특별 규칙: 해당 프렛 하행 생략, 프렛 감소, 1번 줄부터 하행 시작
              nextFretTravDir = 'decreasing'; // 프렛 이동 방향을 '감소'로 변경
              nextFretOff = currentOffset - 1; // 프렛 하나 이전으로
              nextLineNum = GUITAR_STRINGS[GUITAR_STRINGS.length - 1]; // 1번 줄에서 하행 시작
              nextPracDir = 'desc';
            }
          }
        } else {
          // 하행 중 (currentDirection === 'desc')
          if (currentLineIdx > 0) {
            // 현재 줄이 6번 줄이 아니면
            nextLineNum = GUITAR_STRINGS[currentLineIdx - 1]; // 다음 줄로 (6번 줄 방향으로)
          } else {
            // 6번 줄 하행 완료
            if (currentOffset < MAX_FRET_OFFSET) {
              // 아직 최대 프렛이 아니면
              nextFretOff = currentOffset + 1; // 다음 프렛으로
              nextLineNum = GUITAR_STRINGS[0]; // 6번 줄에서 상행 시작
              nextPracDir = 'asc';
            } else {
              // 최대 프렛(9-12)에서 6번 줄 하행 완료
              if (mode === 'traverse_1st_start') {
                // 특별 규칙: 1번줄 시작 모드이고 최대 프렛에서 6번줄 하행 완료시,
                // 현재 프렛에서의 상행을 생략하고, 프렛을 한칸 감소시켜 그곳의 6번줄부터 상행 시작
                nextFretTravDir = 'decreasing';
                nextFretOff = currentOffset - 1;
                nextLineNum = GUITAR_STRINGS[0];
                nextPracDir = 'asc';
              } else {
                // 'traverse_6th_start' 모드
                // 이 경우는 9-12 프렛의 6번줄 하행 완료 후, 동일 프렛(9-12)에서 6번줄 상행 시작
                nextLineNum = GUITAR_STRINGS[0]; // 6번줄에서
                nextPracDir = 'asc'; // 상행 시작
                // fretTraversalDirection은 여전히 'increasing' (최대 프렛 도달 시 한번 'decreasing'으로 바뀌므로)
                // 이 부분에서 fretTraversalDirection을 'decreasing'으로 바꿀 필요 없음.
                // 상행 마치고 1번줄 도달시 decreasing으로 바뀜.
              }
            }
          }
        }
      } else if (currentFretDir === 'decreasing') {
        if (currentDirection === 'desc') {
          // 하행 중
          if (currentLineIdx > 0) {
            // 현재 줄이 6번 줄이 아니면
            nextLineNum = GUITAR_STRINGS[currentLineIdx - 1]; // 다음 줄로 (6번 줄 방향으로)
          } else {
            // 6번 줄 하행 완료
            if (currentOffset > 0) {
              // 아직 0번 프렛(1-4)이 아니면
              nextFretOff = currentOffset - 1; // 이전 프렛으로
              nextLineNum = GUITAR_STRINGS[0]; // 6번 줄에서 상행 시작
              nextPracDir = 'asc';
            } else {
              // 0번 프렛(1-4)에서 6번 줄 하행 완료 (모든 연습 종료)
              stopPractice = true;
              nextFretTravDir = 'done';
            }
          }
        } else {
          // 상행 중 (currentDirection === 'asc')
          if (currentLineIdx < GUITAR_STRINGS.length - 1) {
            // 현재 줄이 1번 줄이 아니면
            nextLineNum = GUITAR_STRINGS[currentLineIdx + 1]; // 다음 줄로 (1번 줄 방향으로)
          } else {
            // 1번 줄 상행 완료
            if (currentOffset > 0) {
              // 아직 0번 프렛(1-4)이 아니면
              nextFretOff = currentOffset - 1; // 이전 프렛으로
              nextLineNum = GUITAR_STRINGS[GUITAR_STRINGS.length - 1]; // 1번 줄에서 하행 시작
              nextPracDir = 'desc';
            } else {
              // 0번 프렛(1-4)에서 1번 줄 상행 완료 (모든 연습 종료)
              // 이 경우는 'traverse_1st_start' 모드에서만 발생 가능
              stopPractice = true;
              nextFretTravDir = 'done';
            }
          }
        }
      }
      const result = {
        nextLineNumber: nextLineNum,
        nextPracticeDirection: nextPracDir,
        nextFretOffset: nextFretOff,
        nextFretTraversalDirection: nextFretTravDir,
        shouldStopPractice: stopPractice,
      };
      console.log('[DEBUG] handleTraverseModeEnd RETURNING:', result);
      return result;
    },
    [],
  );

  const handleMeasureEnd = useCallback(() => {
    if (!isPracticePlaying) return;

    const originalLineNumber = currentLineNumber;
    const originalPracticeDirection = practiceDirection;
    const originalFretOffset = currentFretOffset;
    const originalFretTraversalDirection = fretTraversalDirection;

    let result: ModeEndResult | undefined = undefined;

    console.log(
      `[DEBUG] handleMeasureEnd START. Line: ${originalLineNumber}, Direction: ${originalPracticeDirection}, Mode: ${practiceMode}, FretOffset: ${originalFretOffset}, FretTraversalDirection: ${originalFretTraversalDirection}`,
    );

    if (practiceMode === 'loop') {
      result = handleLoopModeEnd(originalLineNumber, originalPracticeDirection);
    } else if (practiceMode.startsWith('traverse')) {
      result = handleTraverseModeEnd(
        originalLineNumber,
        originalPracticeDirection,
        originalFretOffset,
        originalFretTraversalDirection,
        practiceMode,
      );
    }

    if (result) {
      if (result.shouldStopPractice) {
        console.log('[DEBUG] handleMeasureEnd - Stopping practice.');
        setIsPracticePlaying(false);
        if (
          practiceMode.startsWith('traverse') &&
          result.nextFretTraversalDirection === 'done'
        ) {
          console.log(
            '[DEBUG] handleMeasureEnd - Traverse finished, resetting state.',
          );
          resetToInitialPracticeState(practiceMode);
        }
      } else {
        let nextLineToUse = currentLineNumber;
        let nextDirectionToUse = practiceDirection;
        let nextOffsetToUse = currentFretOffset;

        if (result.nextLineNumber !== undefined) {
          console.log(
            `[DEBUG] handleMeasureEnd - Calling setCurrentLineNumber(${result.nextLineNumber}). Prev: ${currentLineNumber}`,
          );
          setCurrentLineNumber(result.nextLineNumber);
          nextLineToUse = result.nextLineNumber;
        }
        if (result.nextPracticeDirection !== undefined) {
          console.log(
            `[DEBUG] handleMeasureEnd - Calling setPracticeDirection(${result.nextPracticeDirection}). Prev: ${practiceDirection}`,
          );
          setPracticeDirection(result.nextPracticeDirection);
          nextDirectionToUse = result.nextPracticeDirection;
        }

        if (practiceMode.startsWith('traverse')) {
          if (result.nextFretOffset !== undefined) {
            console.log(
              `[DEBUG] handleMeasureEnd - Calling setCurrentFretOffset(${result.nextFretOffset}). Prev: ${currentFretOffset}`,
            );
            setCurrentFretOffset(result.nextFretOffset);
            nextOffsetToUse = result.nextFretOffset;
          }
          if (result.nextFretTraversalDirection !== undefined) {
            console.log(
              `[DEBUG] handleMeasureEnd - Calling setFretTraversalDirection(${result.nextFretTraversalDirection}). Prev: ${fretTraversalDirection}`,
            );
            setFretTraversalDirection(result.nextFretTraversalDirection);
          }
        }

        // Determine the sequence for the next set of notes
        let sequenceForNextNotes = selectedFretSequence;
        if (practiceMode.startsWith('traverse')) {
          sequenceForNextNotes = Array.from(
            { length: DEFAULT_FRET_SEQUENCE_LENGTH },
            (_, i) => i + 1 + nextOffsetToUse, // Use the updated offset
          );
        }

        console.log(
          `[DEBUG] handleMeasureEnd - Generating notes for: Line: ${nextLineToUse}, Dir: ${nextDirectionToUse}, Offset: ${nextOffsetToUse}, Seq: ${sequenceForNextNotes.join(',')}`,
        );
        const newPracticeNotes = generateChromaticNotesArray(
          nextLineToUse, // Use the updated line number
          sequenceForNextNotes,
        );
        console.log(
          `[DEBUG] handleMeasureEnd - Setting practice notes directly. Count: ${newPracticeNotes.length}. First: ${newPracticeNotes.length > 0 ? JSON.stringify(newPracticeNotes[0]) : 'N/A'}`,
        );
        setPracticeNotes(newPracticeNotes);
      }
    }
  }, [
    isPracticePlaying,
    practiceMode,
    currentLineNumber, // Still needed for original values and comparison
    practiceDirection, // Still needed for original values and comparison
    currentFretOffset, // Still needed for original values and comparison
    fretTraversalDirection,
    selectedFretSequence, // Needed for sequenceForNextNotes in loop mode
    setIsPracticePlaying,
    setCurrentLineNumber,
    setPracticeDirection,
    setCurrentFretOffset,
    setFretTraversalDirection,
    resetToInitialPracticeState,
    handleLoopModeEnd,
    handleTraverseModeEnd,
    generateChromaticNotesArray, // Added as a dependency
    setPracticeNotes, // Added as a dependency
    // DEFAULT_FRET_SEQUENCE_LENGTH is a constant, not needed in deps
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
    resetToInitialPracticeState(practiceMode);
  };

  const togglePractice = () => {
    const storeIsPlaying = useNoteStore.getState().isPracticePlaying;
    console.log(
      `[DEBUG] togglePractice CALLED. Store isPlaying: ${storeIsPlaying}, Local isPreparing: ${isPreparingToPlay}`,
    );

    if (practiceStartTimerRef.current) {
      clearTimeout(practiceStartTimerRef.current);
      practiceStartTimerRef.current = null;
    }

    if (storeIsPlaying || isPreparingToPlay) {
      setIsPreparingToPlay(false);
      resetToInitialPracticeState(practiceMode); // This will set isPracticePlaying to false
    } else {
      setIsPreparingToPlay(true);
      useNoteStore.getState().setCurrentNoteIndex(0);
      generateAndSetPracticeNotes(); // Generate notes immediately

      practiceStartTimerRef.current = setTimeout(() => {
        setIsPreparingToPlay(false);
        if (!useNoteStore.getState().isPracticePlaying) {
          // Check again in case it was stopped
          setIsPracticePlaying(true);
        }
        practiceStartTimerRef.current = null;
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (practiceStartTimerRef.current) {
        clearTimeout(practiceStartTimerRef.current);
      }
    };
  }, []);

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
          <Select<number>
            labelId="beat-type-label"
            value={beatType}
            label="Beat Type"
            onChange={handleBeatTypeChange}
          >
            <MenuItem value={4}>4 Beats</MenuItem>
          </Select>
        </FormControl>

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
            disabled={practiceMode.startsWith('traverse')}
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
          ? `Mode: ${practiceMode.replace(/_/g, ' ')} - String: ${currentLineNumber} (${practiceDirection === 'asc' ? 'Ascending' : 'Descending'}) - Frets: ${selectedFretSequence.join('-')} - Beat: ${beatType}/4`
          : `Stopped. Next start: Mode: ${practiceMode.replace(/_/g, ' ')} - String ${currentLineNumber} (Ascending) - Frets: ${selectedFretSequence.join('-')} - Beat: ${beatType}/4`}
      </Typography>

      <MetronomeEngine bpm={bpm} beatType={beatType} />

      <Typography>
        {/* Display current state or logs here if needed */}
      </Typography>
    </Box>
  );
};

export default ChromaticPage;
