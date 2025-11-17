export type DurationUnit = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
// 1 = 16분, 2 = 8분, 4 = 4분 ... 이런 식으로 16분 기준 길이

export type RhythmEventType = 'note' | 'rest';

export interface RhythmEvent {
  /** 마디 기준 시작 위치 (16분 단위) */
  start: number; // 0 ~ 15 (4/4 한정 예시)

  /** 길이 (16분 단위) */
  length: DurationUnit;

  /** 음표 or 쉼표 */
  kind: RhythmEventType;

  /** 점의 개수 (점4분, 점8분 등) */
  dots?: 0 | 1 | 2;

  /** 실제 음높이는 일단 생략 가능 (리듬만 연습이면) */
}

export interface BeatGroup {
  beatIndex: number; // 0,1,2,3 ...
  events: RhythmEvent[]; // 해당 박에 걸치는 이벤트들
}

export interface BeamNoteRef {
  event: RhythmEvent;
  flagLevel: number; // 1 또는 2
}

export interface BeamGroup {
  notes: BeamNoteRef[]; // 이 빔에 묶이는 음표들
}

export interface BeamSegment {
  level: 1 | 2;
  fromX: number;
  toX: number;
  y: number; // 빔 높이
}

export interface Bar {
  beatsPerBar: number;
  events: RhythmEvent[];
}
