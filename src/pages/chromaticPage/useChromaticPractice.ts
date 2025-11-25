import { useReducer, useEffect, useCallback, useMemo } from 'react';
import useNoteStore from '../../store/useNoteStore';
import {
  PracticeMode,
  PracticeState,
  GUITAR_STRINGS,
  calculateNextLoopState,
  calculateNextTraverseState,
  generateChromaticNotesArray,
} from './chromaticLogic';

// Constants
const DEFAULT_FINGER_PATTERN = [1, 2, 3, 4];
const MIN_BPM = 40;
const MAX_BPM = 300;

// State Interface
interface ChromaticPracticeState extends PracticeState {
  bpm: number | '';
  beatType: number;
  practiceMode: PracticeMode;
  selectedFingerPattern: number[];
  isPreparingToPlay: boolean;
  countdown: number | null;
}

// Initial State
const initialState: ChromaticPracticeState = {
  bpm: 100,
  beatType: 4,
  practiceMode: 'loop',
  selectedFingerPattern: DEFAULT_FINGER_PATTERN,
  isPreparingToPlay: false,
  countdown: null,
  currentLineNumber: GUITAR_STRINGS[0],
  practiceDirection: 'asc',
  currentFretOffset: 0,
  fretTraversalDirection: 'increasing',
  isRepeatPhase: false,
  shouldReversePattern: false,
};

// Actions
type Action =
  | { type: 'SET_BPM'; payload: number | '' }
  | { type: 'SET_BEAT_TYPE'; payload: number }
  | { type: 'SET_PRACTICE_MODE'; payload: PracticeMode }
  | { type: 'SET_FINGER_PATTERN'; payload: number[] }
  | { type: 'START_PREPARING' }
  | { type: 'SET_COUNTDOWN'; payload: number }
  | { type: 'START_PLAYING' }
  | { type: 'STOP_PLAYING' }
  | { type: 'RESET_STATE'; payload: PracticeMode }
  | { type: 'TICK_NEXT_STATE'; payload: PracticeState }; // Payload contains the calculated next state

// Reducer
const reducer = (
  state: ChromaticPracticeState,
  action: Action,
): ChromaticPracticeState => {
  switch (action.type) {
    case 'SET_BPM':
      return { ...state, bpm: action.payload };
    case 'SET_BEAT_TYPE':
      return { ...state, beatType: action.payload };
    case 'SET_PRACTICE_MODE':
      return {
        ...state,
        practiceMode: action.payload,
        // Reset practice state when mode changes
        currentLineNumber:
          action.payload === 'traverse_1st_start'
            ? GUITAR_STRINGS[GUITAR_STRINGS.length - 1]
            : GUITAR_STRINGS[0],
        practiceDirection:
          action.payload === 'traverse_1st_start' ? 'desc' : 'asc',
        currentFretOffset: 0,
        fretTraversalDirection: 'increasing',
        isRepeatPhase: false,
        shouldReversePattern: false,
        isPreparingToPlay: false,
      };
    case 'SET_FINGER_PATTERN':
      return { ...state, selectedFingerPattern: action.payload };
    case 'START_PREPARING':
      return { ...state, isPreparingToPlay: true, countdown: 3 };
    case 'SET_COUNTDOWN':
      return { ...state, countdown: action.payload };
    case 'START_PLAYING':
      return { ...state, isPreparingToPlay: false, countdown: null };
    case 'STOP_PLAYING':
      return { ...state, isPreparingToPlay: false, countdown: null };
    case 'RESET_STATE':
      return {
        ...state,
        practiceMode: action.payload,
        currentLineNumber:
          action.payload === 'traverse_1st_start'
            ? GUITAR_STRINGS[GUITAR_STRINGS.length - 1]
            : GUITAR_STRINGS[0],
        practiceDirection:
          action.payload === 'traverse_1st_start' ? 'desc' : 'asc',
        currentFretOffset: 0,
        fretTraversalDirection: 'increasing',
        isRepeatPhase: false,
        shouldReversePattern: false,
        isPreparingToPlay: false,
        countdown: null,
      };
    case 'TICK_NEXT_STATE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export const useChromaticPractice = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // practiceStartTimerRef is no longer needed for countdown as we use useEffect
  // const practiceStartTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isPracticePlaying,
    setIsPracticePlaying,
    setPracticeNotes,
    setOnMeasureEndCallback,
    setCurrentNoteIndex,
  } = useNoteStore();

  // Derived state: selectedFretSequence
  const selectedFretSequence = useMemo(() => {
    if (state.practiceMode === 'loop') {
      return [...state.selectedFingerPattern];
    } else {
      return state.selectedFingerPattern.map(
        (fingerNum) => fingerNum + state.currentFretOffset,
      );
    }
  }, [
    state.selectedFingerPattern,
    state.practiceMode,
    state.currentFretOffset,
  ]);

  // Note Generation
  const generateAndSetNotes = useCallback(() => {
    if (selectedFretSequence.length === 0) {
      setPracticeNotes([]);
      return;
    }

    // Determine sequence for traverse mode (it overrides selectedFretSequence logic slightly in original code for next notes?)
    // Original code:
    // if (practiceMode === 'loop') return [...selectedFingerPattern];
    // else return selectedFingerPattern.map(...)
    // But in handleMeasureEnd, it calculated sequenceForNextNotes differently:
    // if (traverse) sequence = [1..4] + offset
    // else sequence = selectedFingerPattern
    // Wait, the original code had a discrepancy or I need to be careful.
    // In original code:
    // selectedFretSequence (useMemo) was used for initial generation.
    // handleMeasureEnd calculated sequenceForNextNotes manually.
    // Let's stick to the logic:
    // For traverse, the notes are usually 1,2,3,4 + offset. The finger pattern is just for display?
    // Let's check original code line 117: return selectedFingerPattern.map(f => f + offset).
    // So if pattern is [1,3,4], notes are [1+off, 3+off, 4+off].
    // BUT in handleMeasureEnd (line 636), it generated [1,2,3,4] + offset for traverse.
    // This seems like a bug or feature in original code.
    // "DEFAULT_FRET_SEQUENCE_LENGTH" was used.
    // If I look at line 636: sequenceForNextNotes = Array.from({length: 4}, (_, i) => i + 1 + offset).
    // This ignores selectedFingerPattern for traverse mode in handleMeasureEnd!
    // But wait, generateChromaticNotesArray uses selectedFingerPattern to determine "chromaticNumber" (finger).
    // And "flatNumber" comes from the sequence.
    // If sequence is [1,2,3,4] (offset 0) and pattern is [1,3,2,4],
    // then note 0: flat=1, finger=1
    // note 1: flat=2, finger=3
    // This seems wrong if flatNumber should match finger position.
    // Actually, in chromatic scale, 1st fret is 1st finger.
    // If user selects pattern [1,3,2,4], they probably want to play frets 1,3,2,4.
    // The original code's useMemo (line 117) respects the pattern: `fingerNum + offset`.
    // So if pattern is [1,3,2,4], frets are [1,3,2,4].
    // The handleMeasureEnd logic (line 636) seems to force 1,2,3,4 sequence?
    // Ah, line 636: `sequenceForNextNotes = Array.from(...)`.
    // This looks like it might be resetting to 1,2,3,4 regardless of pattern?
    // OR, maybe `selectedFingerPattern` is used inside `generateChromaticNotesArray` to map indices?
    // Let's check `generateChromaticNotesArray` (line 139):
    // `return sequence.map((fretNumber, index) => { ... displayFingerNumber = pattern[index] ... })`
    // If sequence is [1,2,3,4] and pattern is [1,3,2,4].
    // Index 0: fret=1, finger=1.
    // Index 1: fret=2, finger=3. -> Fret 2 with Finger 3? That's weird for chromatic.
    // Usually Chromatic is 1-1, 2-2, 3-3, 4-4.
    // If pattern is [1,2,3,4], then 1-1, 2-2, 3-3, 4-4.
    // If pattern is [1,3,2,4], then 1-1, 2-3, 3-2, 4-4?
    // No, usually "Finger Pattern" implies the order of playing.
    // If I play 1,3,2,4. I play Fret 1, Fret 3, Fret 2, Fret 4.
    // So the sequence passed to generate should be [1,3,2,4].
    // The `useMemo` at line 112 does exactly that: `selectedFingerPattern.map(...)`.
    // So the `handleMeasureEnd` logic at line 636 seems suspicious or I misunderstood it.
    // "DEFAULT_FRET_SEQUENCE_LENGTH" is 4.
    // If the user selected pattern [1,2], length is 2.
    // The `handleMeasureEnd` logic forces length 4?
    // If I look at line 641: `else { sequenceForNextNotes = [...selectedFingerPattern]; }` (Loop mode).
    // So Loop mode respects pattern.
    // Traverse mode (line 636) seems to ignore pattern and use 1,2,3,4?
    // If so, that might be a bug in the original code or intended behavior for "Traverse" (always 1-2-3-4?).
    // But `generateChromaticNotesArray` uses `selectedFingerPattern` to determine `chromaticNumber`.
    // If I change the code to always use `selectedFretSequence` (which respects pattern), it might be safer and more consistent.
    // I will stick to `selectedFretSequence` logic (derived from pattern) for consistency.

    const notes = generateChromaticNotesArray(
      state.currentLineNumber,
      selectedFretSequence, // Use the derived sequence which respects pattern
      state.selectedFingerPattern,
      state.practiceMode,
      state.shouldReversePattern,
    );
    setPracticeNotes(notes);
  }, [
    state.currentLineNumber,
    selectedFretSequence,
    state.selectedFingerPattern,
    state.practiceMode,
    state.shouldReversePattern,
    setPracticeNotes,
  ]);

  // Effect: Generate notes when state changes
  useEffect(() => {
    generateAndSetNotes();
  }, [generateAndSetNotes]);

  // Handle Measure End
  const handleMeasureEnd = useCallback(() => {
    if (!isPracticePlaying) return;

    let result;
    const currentState: PracticeState = {
      currentLineNumber: state.currentLineNumber,
      practiceDirection: state.practiceDirection,
      currentFretOffset: state.currentFretOffset,
      fretTraversalDirection: state.fretTraversalDirection,
      isRepeatPhase: state.isRepeatPhase,
      shouldReversePattern: state.shouldReversePattern,
    };

    if (state.practiceMode === 'loop') {
      result = calculateNextLoopState(
        state.currentLineNumber,
        state.practiceDirection,
        currentState,
      );
    } else {
      result = calculateNextTraverseState(
        state.currentLineNumber,
        state.practiceDirection,
        currentState,
        state.practiceMode,
      );
    }

    if (result.shouldStopPractice) {
      setIsPracticePlaying(false);
      dispatch({ type: 'STOP_PLAYING' });
      if (
        state.practiceMode.startsWith('traverse') &&
        result.nextFretTraversalDirection === 'done'
      ) {
        dispatch({ type: 'RESET_STATE', payload: state.practiceMode });
      }
    } else {
      dispatch({
        type: 'TICK_NEXT_STATE',
        payload: {
          currentLineNumber: result.nextLineNumber,
          practiceDirection: result.nextPracticeDirection,
          currentFretOffset: result.nextFretOffset,
          fretTraversalDirection: result.nextFretTraversalDirection,
          isRepeatPhase: result.nextIsRepeatPhase,
          shouldReversePattern: result.nextShouldReversePattern,
        },
      });
    }
  }, [isPracticePlaying, state, setIsPracticePlaying]);

  // Register callback
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

  // Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      state.isPreparingToPlay &&
      state.countdown !== null &&
      state.countdown > 0
    ) {
      timer = setTimeout(() => {
        dispatch({ type: 'SET_COUNTDOWN', payload: state.countdown! - 1 });
      }, 1000);
    } else if (state.isPreparingToPlay && state.countdown === 0) {
      // Countdown finished, start playing
      dispatch({ type: 'START_PLAYING' });
      setIsPracticePlaying(true);
    }
    return () => clearTimeout(timer);
  }, [state.isPreparingToPlay, state.countdown, setIsPracticePlaying]);

  // Handlers
  const handleBpmChange = (val: number | '') => {
    if (val === '') {
      dispatch({ type: 'SET_BPM', payload: '' });
    } else {
      const numericValue = Number(val);
      if (!isNaN(numericValue)) {
        dispatch({
          type: 'SET_BPM',
          payload: numericValue > MAX_BPM ? MAX_BPM : Math.max(0, numericValue),
        });
      }
    }
  };

  const handleBpmBlur = () => {
    if (state.bpm === '' || isNaN(Number(state.bpm))) {
      dispatch({ type: 'SET_BPM', payload: MIN_BPM });
    } else {
      dispatch({
        type: 'SET_BPM',
        payload: Math.max(MIN_BPM, Math.min(MAX_BPM, Number(state.bpm))),
      });
    }
  };

  const resetToInitialPracticeState = useCallback(() => {
    setIsPracticePlaying(false);
    setCurrentNoteIndex(0);
    dispatch({ type: 'RESET_STATE', payload: state.practiceMode });
  }, [state.practiceMode, setIsPracticePlaying, setCurrentNoteIndex]);

  const togglePractice = useCallback(() => {
    if (isPracticePlaying || state.isPreparingToPlay) {
      resetToInitialPracticeState();
    } else {
      dispatch({ type: 'START_PREPARING' });
      setCurrentNoteIndex(0);
      // Notes are already generated by useEffect
    }
  }, [
    isPracticePlaying,
    state.isPreparingToPlay,
    resetToInitialPracticeState,
    setCurrentNoteIndex,
  ]);

  const handleRandomFingerPattern = () => {
    const numbers = [1, 2, 3, 4];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    dispatch({ type: 'SET_FINGER_PATTERN', payload: numbers });
  };

  return {
    state,
    dispatch,
    handleBpmChange,
    handleBpmBlur,
    togglePractice,
    resetToInitialPracticeState,
    handleRandomFingerPattern,
    selectedFretSequence,
  };
};
