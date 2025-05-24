import { create } from 'zustand';
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

const useNoteStore = create<PracticeNoteState>((set, get) => ({
  practiceNotes: [],
  currentNoteIndex: 0,
  isPracticePlaying: false,
  onMeasureEndCallback: null, // 초기값 null

  setPracticeNotes: (notes) => {
    set((state) => ({
      practiceNotes: notes,
      currentNoteIndex: 0,
      // isPracticePlaying: false, // 새 노트 설정 시 isPracticePlaying 상태는 유지
    }));
  },

  clearPracticeNotes: () => {
    set({
      practiceNotes: [],
      currentNoteIndex: 0,
      isPracticePlaying: false,
      // onMeasureEndCallback: null // 필요하다면 여기서 콜백도 초기화
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
      if (state.practiceNotes.length === 0) {
        return { currentNoteIndex: 0 };
      }
      const nextIndex =
        (state.currentNoteIndex + 1) % state.practiceNotes.length;
      if (
        nextIndex === 0 &&
        state.practiceNotes.length > 0 &&
        state.onMeasureEndCallback
      ) {
        console.log(
          'useNoteStore: End of measure detected, calling onMeasureEndCallback.',
        );
        state.onMeasureEndCallback();
      }
      return { currentNoteIndex: nextIndex };
    });
  },

  setIsPracticePlaying: (isPlaying) => {
    set((state) => {
      if (isPlaying && state.practiceNotes.length === 0) {
        return { isPracticePlaying: false };
      }
      if (isPlaying && state.currentNoteIndex >= state.practiceNotes.length) {
        // 재생 시작 시 인덱스가 범위를 벗어나면 0으로 설정하고 재생
        return { isPracticePlaying: true, currentNoteIndex: 0 };
      }
      // isPracticePlaying 상태가 명시적으로 false로 설정되거나,
      // 혹은 practiceNotes가 있는 상태에서 true로 설정될 때만 업데이트
      if (!isPlaying || state.practiceNotes.length > 0) {
        return { isPracticePlaying: isPlaying };
      }
      // 위의 조건에 해당하지 않으면 (예: isPlaying true인데 노트가 없는 경우) 상태 변경 없음
      return {};
    });
  },

  toggleIsPracticePlaying: () => {
    set((state) => {
      const newIsPlaying = !state.isPracticePlaying;
      if (newIsPlaying && state.practiceNotes.length === 0) {
        return { isPracticePlaying: false }; // 시작하려는데 노트 없으면 시작 안함
      }
      if (
        newIsPlaying &&
        state.currentNoteIndex >= state.practiceNotes.length
      ) {
        // 시작하려는데 인덱스 벗어나면 0으로 하고 시작
        return { isPracticePlaying: true, currentNoteIndex: 0 };
      }
      return { isPracticePlaying: newIsPlaying };
    });
  },

  setOnMeasureEndCallback: (callback) => {
    set({ onMeasureEndCallback: callback });
  },
}));

export default useNoteStore;
