import { Bar, RhythmEvent, RhythmEventType, DurationUnit } from './types';

// ------------------------------
// Types & Interfaces
// ------------------------------

/** start를 제외한 1박(4칸) 패턴 */
export type BeatPattern = Omit<RhythmEvent, 'start'>[];

/** 단계별 규칙 */
export interface StageRules {
  stageId: number;
  name: string;

  /** 1박(=4칸)을 정확히 채우는 박 패턴 후보군 */
  beatPatterns: BeatPattern[];

  /** 마디 전체 밀도/쉼표/점음표 제약 */
  maxDenseBeatsPerBar: number; // length=1(16분)이 등장하는 박의 최대 개수
  minRestEventsPerBar: number; // 마디 내 쉼표 이벤트 최소 개수
  maxRestEventsPerBar: number; // 마디 내 쉼표 이벤트 최대 개수
  maxRestBeatsPerBar?: number; // 쉼표가 포함된 박의 최대 개수
  allowDots: boolean;
  minDottedBeatsPerBar?: number; // 점음표가 포함된 박의 최소 개수
  maxDottedBeatsPerBar: number; // 점음표가 존재하는 박의 최대 개수

  /** 후반 단계에서만 true */
  allowCrossBeatEvents: boolean; // 박 경계 넘어가는 이벤트 허용 여부
}

// ------------------------------
// Constants
// ------------------------------

const SLOTS_PER_BEAT = 4; // 16분 기준 1박=4칸
const SLOTS_PER_BAR = 16; // 4/4 한 마디=16칸

// ------------------------------
// PRNG & Utils
// ------------------------------

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** 박 패턴에 start를 자동 부여 */
function attachStartToBeatPattern(
  beatIndex: number,
  pattern: BeatPattern,
): RhythmEvent[] {
  const beatStart = beatIndex * SLOTS_PER_BEAT;
  let cursor = beatStart;

  return pattern.map((e) => {
    const ev: RhythmEvent = { ...e, start: cursor };
    cursor += e.length;
    return ev;
  });
}

/** 마디 규칙 검증 */
function validateBar(events: RhythmEvent[], rules: StageRules): boolean {
  // 1) 4/4(16칸) 꽉 찼는지
  const total = events.reduce((s, e) => s + e.length, 0);
  if (total !== SLOTS_PER_BAR) return false;

  // 2) 쉼표 이벤트 개수 제약
  const restEvents = events.filter((e) => e.kind === 'rest').length;
  if (
    restEvents < rules.minRestEventsPerBar ||
    restEvents > rules.maxRestEventsPerBar
  )
    return false;

  // 2-1) 쉼표가 포함된 박 개수 제약(optional)
  if (rules.maxRestBeatsPerBar !== undefined) {
    const restBeats = new Set(
      events
        .filter((e) => e.kind === 'rest')
        .map((e) => Math.floor(e.start / 4)),
    );
    if (restBeats.size > rules.maxRestBeatsPerBar) return false;
  }

  // 3) 점음표 박 개수 제약
  const dottedBeats = new Set(
    events.filter((e) => (e.dots ?? 0) > 0).map((e) => Math.floor(e.start / 4)),
  );
  if (!rules.allowDots && dottedBeats.size > 0) return false;
  if (dottedBeats.size > rules.maxDottedBeatsPerBar) return false;
  if (
    rules.minDottedBeatsPerBar !== undefined &&
    dottedBeats.size < rules.minDottedBeatsPerBar
  )
    return false;

  // 4) 16분 밀도 박 개수 제약(대략)
  const denseBeats = new Set(
    events.filter((e) => e.length === 1).map((e) => Math.floor(e.start / 4)),
  );
  if (denseBeats.size > rules.maxDenseBeatsPerBar) return false;

  // 5) 박 경계 넘는 이벤트 금지(초중반)
  if (!rules.allowCrossBeatEvents) {
    for (const e of events) {
      const beatStart = Math.floor(e.start / 4) * 4;
      const beatEnd = beatStart + 4;
      if (e.start + e.length > beatEnd) return false;
    }
  }

  return true;
}

/** 단계 규칙에 맞는 무작위 1마디 생성(seed로 재현 가능) */
export function generateBarForStage(rules: StageRules, seed: number): Bar {
  const rand = mulberry32(seed);
  let attempts = 0;
  const MAX_ATTEMPTS = 1000;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    const beatEvents = [0, 1, 2, 3].map((beatIndex) => {
      const pattern = pick(rules.beatPatterns, rand);
      return attachStartToBeatPattern(beatIndex, pattern);
    });

    const events = beatEvents.flat().sort((a, b) => a.start - b.start);

    if (validateBar(events, rules)) {
      return { beatsPerBar: 4, events };
    }
  }

  // Fallback: return a simple bar if generation fails
  console.warn(
    `Failed to generate bar for stage ${rules.stageId} after ${MAX_ATTEMPTS} attempts. Returning fallback.`,
  );
  return {
    beatsPerBar: 4,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 4, kind: 'note' },
    ],
  };
}

// ------------------------------
// Stage Rules Definitions
// ------------------------------

export const STAGE_1_RULES: StageRules = {
  stageId: 1,
  name: 'Stage 1 – Quarter Notes & Quarter Rests',
  beatPatterns: [[{ length: 4, kind: 'note' }], [{ length: 4, kind: 'rest' }]],
  maxDenseBeatsPerBar: 0,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 4,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

export const STAGE_2_RULES: StageRules = {
  stageId: 2,
  name: 'Stage 2 – Adding Eighth Notes',
  beatPatterns: [
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'rest' },
    ],
    [
      { length: 2, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
  ],
  maxDenseBeatsPerBar: 0,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 6,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

export const STAGE_3_RULES: StageRules = {
  stageId: 3,
  name: 'Stage 3 – Introducing Sixteenth Notes',
  beatPatterns: [
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'rest' },
    ],
    [
      { length: 2, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],
  ],
  maxDenseBeatsPerBar: 0,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 8,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

export const STAGE_4_RULES: StageRules = {
  stageId: 4,
  name: 'Stage 4 – Sixteenth Notes',
  beatPatterns: [
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],
  ],
  maxDenseBeatsPerBar: 2,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 8,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

export const STAGE_5_RULES: StageRules = {
  stageId: 5,
  name: 'Stage 5 – Sixteenth rests focus',
  beatPatterns: [
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 1, kind: 'rest' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
  ],
  maxDenseBeatsPerBar: 2,
  minRestEventsPerBar: 1,
  maxRestEventsPerBar: 5,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

export const STAGE_6_RULES: StageRules = {
  stageId: 6,
  name: 'Stage 6 – Mixed density',
  beatPatterns: [
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
    [
      { length: 2, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
  ],
  maxDenseBeatsPerBar: 3,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 6,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

export const STAGE_7_RULES: StageRules = {
  stageId: 7,
  name: 'Stage 7 – Dotted Rhythms',
  beatPatterns: [
    [
      { length: 3, kind: 'note', dots: 1 },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 3, kind: 'note', dots: 1 },
      { length: 1, kind: 'rest' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 3, kind: 'note', dots: 1 },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],
  ],
  maxDenseBeatsPerBar: 2,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 5,
  allowDots: true,
  minDottedBeatsPerBar: 1,
  maxDottedBeatsPerBar: 2,
  allowCrossBeatEvents: false,
};

export const STAGE_8_RULES: StageRules = {
  stageId: 8,
  name: 'Stage 8 – Mixed dotted & cross-beat',
  beatPatterns: [
    [
      { length: 3, kind: 'note', dots: 1 },
      { length: 1, kind: 'note' },
    ],
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [
      { length: 1, kind: 'rest' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],
  ],
  maxDenseBeatsPerBar: 3,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 7,
  allowDots: true,
  minDottedBeatsPerBar: 0,
  maxDottedBeatsPerBar: 1,
  allowCrossBeatEvents: true,
};

export const ALL_STAGE_RULES: Record<number, StageRules> = {
  1: STAGE_1_RULES,
  2: STAGE_2_RULES,
  3: STAGE_3_RULES,
  4: STAGE_4_RULES,
  5: STAGE_5_RULES,
  6: STAGE_6_RULES,
  7: STAGE_7_RULES,
  8: STAGE_8_RULES,
};

/**
 * 특정 스테이지의 랜덤 프리셋 생성
 * @param stageId 스테이지 ID
 * @param seed 시드 (재현 가능성)
 * @param barCount 생성할 마디 수 (기본 16)
 */
export function generateStagePreset(
  stageId: number,
  seed: number,
  barCount: number = 16,
): { bars: Bar[]; name: string } {
  const rules = ALL_STAGE_RULES[stageId];
  if (!rules) {
    throw new Error(`Unknown stage ID: ${stageId}`);
  }

  const bars: Bar[] = [];
  // 각 마디마다 시드를 다르게 주어 랜덤성 확보
  for (let i = 0; i < barCount; i++) {
    bars.push(generateBarForStage(rules, seed + i * 1000));
  }

  return {
    bars,
    name: rules.name,
  };
}
