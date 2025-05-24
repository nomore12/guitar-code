import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface AppSettingsState {
  theme: Theme;
  lastVisitedPath: string | null;
  setTheme: (theme: Theme) => void;
  setLastVisitedPath: (path: string | null) => void;
  loadInitialSettings: () => Promise<void>; // 비동기 액션 예시
}

// 액션 내 복잡할 수 있는 로직을 위한 헬퍼 함수 (예시)
const getSystemPreferenceTheme = (): Theme => {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
};

export const useAppSettingsStore = create<AppSettingsState>()(
  devtools(
    // 1. Redux DevTools 연동을 위한 미들웨어
    persist(
      // 2. localStorage에 상태를 저장하기 위한 미들웨어
      (set, get) => ({
        theme: getSystemPreferenceTheme(), // 시스템 설정을 따르거나 기본값으로 초기화
        lastVisitedPath: null,

        // 단일 책임을 가지는 간단한 동기 액션
        setTheme: (newTheme) => {
          console.log('AppSettingsStore: 테마 변경 ->', newTheme);
          set({ theme: newTheme });
        },

        setLastVisitedPath: (path) => {
          set({ lastVisitedPath: path });
        },

        // 비동기 액션 예시 (서버 없이도 활용 가능)
        // 예: 애플리케이션 시작 시 초기 설정을 비동기적으로 로드 (여기서는 setTimeout으로 시뮬레이션)
        loadInitialSettings: async () => {
          console.log('AppSettingsStore: 초기 설정 로드 시뮬레이션 시작...');
          // 실제 앱에서는 IndexedDB, 로컬 파일 시스템 API (Electron 등),
          // 또는 복잡한 계산 결과를 여기서 처리할 수 있습니다.
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 딜레이 시뮬레이션

          const preferredTheme = getSystemPreferenceTheme(); // 헬퍼 함수 사용
          // set 내부에서 get()을 사용하여 현재 상태를 읽어올 수도 있습니다.
          console.log('AppSettingsStore: 현재 테마 (로드 전):', get().theme);

          set({ theme: preferredTheme, lastVisitedPath: '/dashboard' });
          console.log(
            'AppSettingsStore: 초기 설정 로드 완료 (시뮬레이션). 새 테마:',
            preferredTheme,
          );
        },
      }),
      {
        name: 'app-settings-storage', // localStorage에 저장될 때 사용될 키 이름
        // 특정 상태만 persist 하고 싶을 경우 partialize 옵션 사용 가능
        // partialize: (state) => ({ theme: state.theme }),
      },
    ),
    { name: 'AppSettingsStore' }, // Redux DevTools에 표시될 스토어 이름
  ),
);

// 컴포넌트에서 스토어 사용 예시 (참고용)
// import { useEffect } from 'react';
// const Component = () => {
//   const { theme, setTheme, loadInitialSettings } = useAppSettingsStore();
//
//   useEffect(() => {
//     // 앱 마운트 시 초기 설정 로드
//     loadInitialSettings();
//   }, [loadInitialSettings]);
//
//   const toggleTheme = () => {
//     setTheme(theme === 'light' ? 'dark' : 'light');
//   };
//   return <button onClick={toggleTheme}>Current theme: {theme}</button>;
// }
