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
// 예시:
// interface ChromaticNote {
//   flatNumber: number;
//   lineNumber: number;
//   chromaticNumber: number;
//   chord: string;
// }

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

// 새로운 상수 정의
const AVAILABLE_FINGER_NUMBERS = [1, 2, 3, 4]; // 사용자가 선택 가능한 손가락 번호
const DEFAULT_FINGER_PATTERN = [1, 2, 3, 4]; // 기본 손가락 패턴 순서

const MIN_BPM = 40; // BPM 최소값 상수 추가
const MAX_BPM = 300; // BPM 최대값 상수 추가

const ChromaticPage: React.FC = () => {
  const [bpm, setBpm] = useState<number | ''>(100); // 타입 string | number로 변경하여 빈 값 허용
  const [selectedFretSequence, setSelectedFretSequence] = useState<number[]>(
    DEFAULT_FINGER_PATTERN,
  );
  const [practiceDirection, setPracticeDirection] =
    useState<PracticeDirection>('asc');
  const [currentLineNumber, setCurrentLineNumber] = useState<number>(
    GUITAR_STRINGS[0],
  );
  const [beatType, setBeatType] = useState<number>(4);
  const practiceStartTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('loop');
  const [currentFretOffset, setCurrentFretOffset] = useState<number>(0);
  const [fretTraversalDirection, setFretTraversalDirection] =
    useState<FretTraversalDirection>('increasing');
  const [isPreparingToPlay, setIsPreparingToPlay] = useState<boolean>(false);

  const [selectedFingerPattern, setSelectedFingerPattern] = useState<number[]>(
    DEFAULT_FINGER_PATTERN,
  );

  const {
    isPracticePlaying,
    setPracticeNotes,
    setIsPracticePlaying,
    setOnMeasureEndCallback,
  } = useNoteStore();

  // useEffect to dynamically update selectedFretSequence (actual frets to play)
  useEffect(() => {
    let newCalculatedSequence: number[];
    if (practiceMode === 'loop') {
      newCalculatedSequence = [...selectedFingerPattern];
    } else {
      // Traverse mode
      newCalculatedSequence = selectedFingerPattern.map(
        (fingerNum) => fingerNum + currentFretOffset,
      );
    }
    if (
      JSON.stringify(newCalculatedSequence) !==
      JSON.stringify(selectedFretSequence)
    ) {
      console.log(
        `[DEBUG useEffect/selectedFretSequence] Updating selectedFretSequence from ${selectedFretSequence.join(',')} to ${newCalculatedSequence.join(',')}. Mode: ${practiceMode}, Offset: ${currentFretOffset}, Pattern: ${selectedFingerPattern.join(',')}`,
      );
      setSelectedFretSequence(newCalculatedSequence);
    }
  }, [selectedFingerPattern, practiceMode, currentFretOffset]);

  const generateChromaticNotesArray = useCallback(
    (line: number, sequence: number[]): ChromaticNote[] => {
      return sequence.map((fretNumber, index) => {
        const displayFingerNumber =
          selectedFingerPattern[index] !== undefined
            ? selectedFingerPattern[index]
            : index + 1;
        return {
          flatNumber: fretNumber,
          lineNumber: line,
          chromaticNumber: index + 1,
          chord: String(displayFingerNumber),
        };
      });
    },
    [selectedFingerPattern],
  );

  const generateAndSetPracticeNotes = useCallback(() => {
    console.log(
      `[DEBUG] generateAndSetPracticeNotes CALLED. Line: ${currentLineNumber}, Dir: ${practiceDirection}, ActualFretSeq: ${selectedFretSequence.join(',')}, Pattern for chords: ${selectedFingerPattern.join(',')}`,
    );
    const newPracticeNotes = generateChromaticNotesArray(
      currentLineNumber,
      selectedFretSequence,
    );
    setPracticeNotes(newPracticeNotes);
  }, [
    currentLineNumber,
    practiceDirection,
    selectedFretSequence,
    selectedFingerPattern, // Directly depend on selectedFingerPattern
    generateChromaticNotesArray, // Keep this as it depends on selectedFingerPattern too.
    setPracticeNotes,
  ]);

  // useEffect to regenerate notes
  useEffect(() => {
    console.log(
      `[DEBUG useEffect/noteGeneration] Triggered. Line: ${currentLineNumber}, Dir: ${practiceDirection}, ActualFretSeq: ${selectedFretSequence.join(',')}`,
    );
    if (selectedFretSequence && selectedFretSequence.length > 0) {
      generateAndSetPracticeNotes();
    } else if (selectedFretSequence && selectedFretSequence.length === 0) {
      // If the pattern becomes empty, clear the notes on the fretboard
      setPracticeNotes([]);
      console.log(
        '[DEBUG useEffect/noteGeneration] Empty finger pattern selected, clearing notes.',
      );
    }
  }, [
    currentLineNumber,
    practiceDirection,
    selectedFretSequence,
    generateAndSetPracticeNotes,
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
      useNoteStore.getState().setCurrentNoteIndex(0);

      setCurrentFretOffset(0);
      setFretTraversalDirection('increasing');
      setPracticeMode(modeToResetTo);
      setSelectedFingerPattern(DEFAULT_FINGER_PATTERN);

      if (modeToResetTo === 'loop') {
        setCurrentLineNumber(GUITAR_STRINGS[0]);
        setPracticeDirection('asc');
      } else if (modeToResetTo === 'traverse_6th_start') {
        setCurrentLineNumber(GUITAR_STRINGS[0]);
        setPracticeDirection('asc');
      } else if (modeToResetTo === 'traverse_1st_start') {
        setCurrentLineNumber(GUITAR_STRINGS[GUITAR_STRINGS.length - 1]);
        setPracticeDirection('desc');
      }
    },
    [
      setIsPracticePlaying,
      setCurrentFretOffset,
      setFretTraversalDirection,
      setCurrentLineNumber,
      setPracticeDirection,
      setPracticeMode,
      setSelectedFingerPattern,
    ],
  );

  const handleNodeClick = (node: ChromaticNote) => {
    console.log('Node clicked:', node); //  handleNodeClick 내용 유지 (이전 코드에서 내용 없었음)
  };

  // BPM 변경 핸들러 구현
  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setBpm(''); // 빈 문자열 허용
    } else {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        // 입력 중에는 최대값을 넘어도 일단 반영 (onBlur에서 최종 조정)
        // 음수 입력 방지
        setBpm(numericValue > MAX_BPM ? MAX_BPM : Math.max(0, numericValue));
      }
    }
  };

  // BPM 입력 필드 focus out 핸들러 구현
  const handleBpmBlur = () => {
    if (bpm === '') {
      setBpm(MIN_BPM); // 비어있으면 최소값으로 설정
      return;
    }
    let numericBpm = parseInt(String(bpm), 10);

    if (isNaN(numericBpm)) {
      numericBpm = MIN_BPM; // 숫자가 아니면 최소값으로
    }

    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, numericBpm))); // 최종적으로 min/max 범위 적용
  };

  const handleFingerPatternChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value as number[];
    if (Array.isArray(value)) {
      console.log('[DEBUG] handleFingerPatternChange (User Editable):', value);
      setSelectedFingerPattern([...value]);
    }
  };

  const handleBeatTypeChange = (event: SelectChangeEvent<number>) => {
    setBeatType(event.target.value as number); // 이전 코드에서 내용 없었으므로 유지
  };

  const handlePracticeModeChange = (event: SelectChangeEvent<PracticeMode>) => {
    const newMode = event.target.value as PracticeMode;
    console.log(`[DEBUG] handlePracticeModeChange to ${newMode}`);
    if (practiceStartTimerRef.current) {
      clearTimeout(practiceStartTimerRef.current);
      practiceStartTimerRef.current = null;
    }
    setIsPracticePlaying(false);

    setPracticeMode(newMode);
    setCurrentFretOffset(0);
    setFretTraversalDirection('increasing');
    setSelectedFingerPattern(DEFAULT_FINGER_PATTERN);

    if (newMode === 'loop') {
      setCurrentLineNumber(GUITAR_STRINGS[0]);
      setPracticeDirection('asc');
    } else if (newMode === 'traverse_6th_start') {
      setCurrentLineNumber(GUITAR_STRINGS[0]);
      setPracticeDirection('asc');
    } else if (newMode === 'traverse_1st_start') {
      setCurrentLineNumber(GUITAR_STRINGS[GUITAR_STRINGS.length - 1]);
      setPracticeDirection('desc');
    }
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
      const lastStringIdx = GUITAR_STRINGS.length - 1; // 1번 줄 인덱스 (e.g., 5 for [6,5,4,3,2,1])
      const firstStringIdx = 0; // 6번 줄 인덱스 (e.g., 0)
      const secondLastStringIdx = GUITAR_STRINGS.length - 2; // 2번 줄 인덱스 (e.g., 4)
      const secondStringIdx = 1; // 5번 줄 인덱스 (e.g., 1)

      if (currentDirection === 'asc') {
        if (currentLineIdx === secondLastStringIdx) {
          // 현재 2번 줄에서 상행 연습 완료 시
          nextLine = GUITAR_STRINGS[currentLineIdx + 1]; // 다음 줄은 1번 줄
          nextDir = 'desc'; // 1번 줄 연주 방향은 'desc'로 미리 결정
        } else if (currentLineIdx < lastStringIdx) {
          // 6,5,4,3번 줄에서 상행 완료 시 (아직 1번 줄 아님)
          nextLine = GUITAR_STRINGS[currentLineIdx + 1]; // 다음 줄로 이동, 방향은 'asc' 유지
          // nextDir is already 'asc'
        } else {
          // 현재 1번 줄에서 상행 연습 완료 시 (currentLineIdx === lastStringIdx)
          // 이 분기는 새 로직 하에서는 일반적으로 도달하지 않기를 기대하지만, 안전장치로 남겨둡니다.
          // (예: 초기 상태가 1번 줄, 'asc'일 경우)
          // 기존 로직: 1번 줄에 머무르며 'desc'로 전환
          nextLine = currentLine;
          nextDir = 'desc';
        }
      } else {
        // currentDirection === 'desc'
        if (currentLineIdx === secondStringIdx) {
          // 현재 5번 줄에서 하행 연습 완료 시
          nextLine = GUITAR_STRINGS[currentLineIdx - 1]; // 다음 줄은 6번 줄
          nextDir = 'asc'; // 6번 줄 연주 방향은 'asc'로 미리 결정
        } else if (currentLineIdx > firstStringIdx) {
          // 1,2,3,4번 줄에서 하행 완료 시 (아직 6번 줄 아님)
          nextLine = GUITAR_STRINGS[currentLineIdx - 1]; // 다음 줄로 이동, 방향은 'desc' 유지
          // nextDir is already 'desc'
        } else {
          // 현재 6번 줄에서 하행 연습 완료 시 (currentLineIdx === firstStringIdx)
          // 이 분기는 새 로직 하에서는 일반적으로 도달하지 않기를 기대하지만, 안전장치로 남겨둡니다.
          // 기존 로직: 6번 줄에 머무르며 'asc'로 전환
          nextLine = currentLine;
          nextDir = 'asc';
        }
      }

      const result = {
        nextLineNumber: nextLine,
        nextPracticeDirection: nextDir,
      };
      console.log('[DEBUG] handleLoopModeEnd (MODIFIED V2) RETURNING:', result); // This console log was in user's code
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
        // 이 부분은 사용자의 원래 코드 구조를 최대한 유지합니다.
        // nextLineToUse, nextDirectionToUse, nextOffsetToUse 변수들은 사용자의 원래 코드에 명시적으로 선언되어 있지 않았습니다.
        // result 객체의 속성을 직접 사용하거나, 현재 상태값을 사용합니다.

        if (result.nextLineNumber !== undefined) {
          console.log(
            `[DEBUG] handleMeasureEnd - Calling setCurrentLineNumber(${result.nextLineNumber}). Prev: ${currentLineNumber}`,
          );
          setCurrentLineNumber(result.nextLineNumber);
        }
        if (result.nextPracticeDirection !== undefined) {
          console.log(
            `[DEBUG] handleMeasureEnd - Calling setPracticeDirection(${result.nextPracticeDirection}). Prev: ${practiceDirection}`,
          );
          setPracticeDirection(result.nextPracticeDirection);
        }

        if (practiceMode.startsWith('traverse')) {
          if (result.nextFretOffset !== undefined) {
            console.log(
              `[DEBUG] handleMeasureEnd - Calling setCurrentFretOffset(${result.nextFretOffset}). Prev: ${currentFretOffset}`,
            );
            setCurrentFretOffset(result.nextFretOffset);
          }
          if (result.nextFretTraversalDirection !== undefined) {
            console.log(
              `[DEBUG] handleMeasureEnd - Calling setFretTraversalDirection(${result.nextFretTraversalDirection}). Prev: ${fretTraversalDirection}`,
            );
            setFretTraversalDirection(result.nextFretTraversalDirection);
          }
        }

        // Determine the sequence for the next set of notes
        let sequenceForNextNotes = selectedFretSequence; // 사용자의 원래 코드에 있던 'let'
        // 다음 상태값을 참조해야 하므로, result 값을 우선적으로 사용합니다.
        const offsetForNextNotes =
          result.nextFretOffset !== undefined
            ? result.nextFretOffset
            : currentFretOffset;

        if (practiceMode.startsWith('traverse')) {
          sequenceForNextNotes = Array.from(
            { length: DEFAULT_FRET_SEQUENCE_LENGTH },
            (_, i) => i + 1 + offsetForNextNotes,
          );
        }

        // 다음 연주될 라인 넘버와 시퀀스를 사용
        const lineForNextNotes =
          result.nextLineNumber !== undefined
            ? result.nextLineNumber
            : currentLineNumber;
        const directionForNextNotes =
          result.nextPracticeDirection !== undefined
            ? result.nextPracticeDirection
            : practiceDirection;

        console.log(
          `[DEBUG] handleMeasureEnd - Generating notes for: Line: ${lineForNextNotes}, Dir: ${directionForNextNotes}, Offset: ${offsetForNextNotes}, Seq: ${sequenceForNextNotes.join(',')}`,
        );
        const newPracticeNotes = generateChromaticNotesArray(
          lineForNextNotes,
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
    currentLineNumber,
    practiceDirection,
    currentFretOffset,
    fretTraversalDirection,
    selectedFretSequence,
    setIsPracticePlaying,
    setCurrentLineNumber,
    setPracticeDirection,
    setCurrentFretOffset,
    setFretTraversalDirection,
    resetToInitialPracticeState,
    handleLoopModeEnd,
    handleTraverseModeEnd,
    generateChromaticNotesArray,
    setPracticeNotes,
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

  const handleRandomFingerPattern = () => {
    const numbers = [...AVAILABLE_FINGER_NUMBERS];
    // Fisher-Yates (aka Knuth) Shuffle Algorithm
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    console.log(
      '[DEBUG] handleRandomFingerPattern - New random pattern:',
      numbers,
    );
    setSelectedFingerPattern(numbers);
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
          onBlur={handleBpmBlur} // onBlur 핸들러 추가
          sx={{ width: 100 }} // 사용자의 원래 너비 유지
          inputProps={{
            // inputProps 추가
            min: MIN_BPM,
            max: MAX_BPM,
            step: 1, // 스텝 추가 (선택 사항)
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="beat-type-label">Beat Type</InputLabel>
          <Select<number>
            labelId="beat-type-label"
            value={beatType}
            label="Beat Type"
            onChange={handleBeatTypeChange}
          >
            {/* 사용자의 원래 코드에서는 <MenuItem value={4}>4 Beats</MenuItem> 만 있었음 */}
            {/* availableBeatTypes 를 순회하도록 변경된 것은 이전 버전이므로, 사용자의 원래 코드를 따르려면 아래와 같이 직접 명시 */}
            <MenuItem value={4}>4 Beats</MenuItem>
            {/* {availableBeatTypes.map((bt) => (
              <MenuItem key={bt} value={bt}>{`${bt} Beats`}</MenuItem>
            ))} */}
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
          <InputLabel id="finger-pattern-label">Finger Pattern</InputLabel>
          <Select<number[]>
            labelId="finger-pattern-label"
            multiple
            value={selectedFingerPattern}
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
          sx={{ height: 56 }} // Match height of other controls
        >
          Random
        </Button>

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
          ? `Mode: ${practiceMode.replace(/_/g, ' ')} - String: ${currentLineNumber} (${practiceDirection === 'asc' ? 'Ascending' : 'Descending'}) - Pattern: ${selectedFingerPattern.join('-')} (Frets: ${selectedFretSequence.join('-')}) - Beat: ${beatType}/4`
          : `Stopped. Next start: Mode: ${practiceMode.replace(/_/g, ' ')} - String ${currentLineNumber} (Ascending) - Pattern: ${selectedFingerPattern.join('-')} (Frets: ${selectedFretSequence.join('-')}) - Beat: ${beatType}/4`}
      </Typography>

      <MetronomeEngine
        bpm={
          bpm === ''
            ? MIN_BPM
            : Math.max(MIN_BPM, Math.min(MAX_BPM, Number(bpm)))
        } // 유효한 BPM 값 전달
        beatType={beatType}
      />

      <Typography>
        {/* Display current state or logs here if needed */}
      </Typography>
    </Box>
  );
};

export default ChromaticPage;
