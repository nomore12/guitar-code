declare interface ChromaticNote {
  flatNumber: number;
  lineNumber: number;
  chromaticNumber: number; // 사용자가 선택한 순서
  chord: string; // 음이름 또는 표시될 텍스트 (예: '1', '2', '3', '4')
  codeTone?: boolean | number; // 하이라이트 상태 (0: none, 1: previous, 2: current, 3: next)
}

declare interface Note {
  flatNumber: number;
  lineNumber: number;
  chord: string; // 음이름 또는 표시될 텍스트 (예: '1', '2', '3', '4')
  codeTone?: boolean | number; // 하이라이트 상태 (0: none, 1: previous, 2: current, 3: next)
}
