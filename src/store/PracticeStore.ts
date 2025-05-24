import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Zustand 상태 타입 정의
interface NoteStore {
  notes: Note[];
  addNote: (note: Note) => void; // index는 자동 추가
  setPracticeNotes: (notes: Note[]) => void;
  removeNote: (index: number) => void;
  clearNotes: () => void;
  currentIndex: number;
  incrementIndex: () => void;
  isPracticePlaying: boolean;
  setIsPracticePlaying: (isPlaying: boolean) => void;
}

// Zustand 상태 생성
const useNoteStore = create<NoteStore>()(
  devtools(
    persist(
      (set, get) => ({
        notes: [],
        currentIndex: 0,
        addNote: (note: Note) => {
          const currentNotes = get().notes;
          set({
            notes: [...currentNotes, note],
          });
        },
        setPracticeNotes: (notes: Note[]) => {
          set({ notes });
        },
        removeNote: (index) => {
          const updatedNotes = get().notes.filter((_, i) => i !== index);
          set({ notes: updatedNotes });
        },
        clearNotes: () => set({ notes: [], currentIndex: 0 }),
        incrementIndex: () =>
          set((state) => ({ currentIndex: state.currentIndex + 1 })),
        isPracticePlaying: false,
        setIsPracticePlaying: (isPlaying) =>
          set({ isPracticePlaying: isPlaying }),
      }),
      {
        name: 'note-storage', // localStorage에 저장될 키 이름
      },
    ),
    { name: 'NoteStore' }, // 디버깅 이름
  ),
);

export default useNoteStore;
