import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
// ChromaticNote는 전역으로 선언되어 있다고 가정

interface PracticeNoteState {
  practiceNotes: ChromaticNote[];
  currentNoteIndex: number;
  isPracticePlaying: boolean;
  onMeasureEndCallback?: (() => void) | null; // 마디 종료 콜백 함수 (선택적, null 가능)

  setPracticeNotes: (notes: ChromaticNote[]) => void;
  clearPracticeNotes: () => void;
  setCurrentNoteIndex: (index: number) => void;
  incrementCurrentNoteIndex: () => void;
  setIsPracticePlaying: (isPlaying: boolean) => void;
  toggleIsPracticePlaying: () => void;
  setOnMeasureEndCallback: (callback: (() => void) | null) => void; // 콜백 설정 함수
}

const useNoteStore = create<PracticeNoteState>()(
  devtools(
    (set, get) => ({
      practiceNotes: [],
      currentNoteIndex: 0,
      isPracticePlaying: false,
      onMeasureEndCallback: null,

      setPracticeNotes: (notes) => {
        set((state) => ({
          practiceNotes: notes,
          currentNoteIndex: 0,
        }));
      },

      clearPracticeNotes: () => {
        set({
          practiceNotes: [],
          currentNoteIndex: 0,
          isPracticePlaying: false,
        });
      },

      setCurrentNoteIndex: (index) => {
        const { practiceNotes } = get();
        if (index >= 0 && index < practiceNotes.length) {
          set({ currentNoteIndex: index });
        } else {
          set({ currentNoteIndex: 0 });
        }
      },

      incrementCurrentNoteIndex: () => {
        set((state) => {
          if (!state.isPracticePlaying || state.practiceNotes.length === 0) {
            console.log(
              '[DEBUG useNoteStore] incrementCurrentNoteIndex: Not playing or no notes, returning.',
            );
            return {};
          }

          const isLastNote =
            state.currentNoteIndex >= state.practiceNotes.length - 1;
          // console.log(`[DEBUG useNoteStore] incrementCurrentNoteIndex: currentIdx=${state.currentNoteIndex}, notesLen=${state.practiceNotes.length}, isLastNote=${isLastNote}`);

          if (isLastNote) {
            if (state.onMeasureEndCallback) {
              // console.log('[DEBUG useNoteStore] incrementCurrentNoteIndex: Last note, calling onMeasureEndCallback.');
              state.onMeasureEndCallback();
            }
            // Crucially, set currentNoteIndex to 0 *here* as well to ensure it's immediately ready for the new measure,
            // regardless of the exact timing of setPracticeNotes from the callback.
            // console.log('[DEBUG useNoteStore] incrementCurrentNoteIndex: Last note, setting index to 0 directly.');
            return { currentNoteIndex: 0 };
          } else {
            // Not the last note, so increment currentNoteIndex.
            // console.log(`[DEBUG useNoteStore] incrementCurrentNoteIndex: Not last note, incrementing index to ${state.currentNoteIndex + 1}.`);
            return { currentNoteIndex: state.currentNoteIndex + 1 };
          }
        });
      },

      setIsPracticePlaying: (isPlaying) => {
        set((state) => {
          if (isPlaying && state.practiceNotes.length === 0) {
            return { isPracticePlaying: false };
          }
          if (
            isPlaying &&
            state.currentNoteIndex >= state.practiceNotes.length
          ) {
            return { isPracticePlaying: true, currentNoteIndex: 0 };
          }
          if (!isPlaying || state.practiceNotes.length > 0) {
            return { isPracticePlaying: isPlaying };
          }
          return {};
        });
      },

      toggleIsPracticePlaying: () => {
        set((state) => {
          const newIsPlaying = !state.isPracticePlaying;
          if (newIsPlaying && state.practiceNotes.length === 0) {
            return { isPracticePlaying: false };
          }
          if (
            newIsPlaying &&
            state.currentNoteIndex >= state.practiceNotes.length
          ) {
            return { isPracticePlaying: true, currentNoteIndex: 0 };
          }
          return { isPracticePlaying: newIsPlaying };
        });
      },

      setOnMeasureEndCallback: (callback) => {
        set({ onMeasureEndCallback: callback });
      },
    }),
    { name: 'NoteStore' },
  ),
);

export default useNoteStore;
