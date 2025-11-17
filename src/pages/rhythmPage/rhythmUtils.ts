import {
  BeamGroup,
  BeatGroup,
  BeamNoteRef,
  RhythmEvent,
  BeamSegment,
} from './types';

export function computeFlagLevel(event: RhythmEvent): number {
  if (event.length >= 4) return 0; // 4분 이상
  if (event.length >= 2) return 1; // 8분 계열 (2~3칸)
  return 2; // 16분 계열 (1칸)
}

export function makeBeamGroups(beat: BeatGroup): BeamGroup[] {
  const result: BeamGroup[] = [];
  let current: BeamGroup | null = null;

  const sorted = [...beat.events].sort((a, b) => a.start - b.start);
  for (const e of sorted) {
    const flagLevel = computeFlagLevel(e);

    // 쉼표 or 꼬리 없는 음표면 빔 종료
    if (e.kind === 'rest' || flagLevel === 0) {
      if (current && current.notes.length > 1) result.push(current);
      current = null;
      continue;
    }

    // 꼬리 있는 음표
    if (!current) {
      current = { notes: [] };
    }
    current.notes.push({ event: e, flagLevel });
  }

  if (current && current.notes.length > 1) result.push(current);
  return result;
}

export function computeBeamSegments(
  group: BeamGroup,
  notePositions: Map<RhythmEvent, number>,
): BeamSegment[] {
  const segments: BeamSegment[] = [];

  // 1레벨 빔: 그룹 전체를 하나로 연결
  const first = group.notes[0];
  const last = group.notes[group.notes.length - 1];
  segments.push({
    level: 1,
    fromX: notePositions.get(first.event)!,
    toX: notePositions.get(last.event)!,
    y: 1, // 계산된 y 위치
  });

  // 2레벨 빔: 인접한 flagLevel=2 노트들끼리만 연결
  let runStart: BeamNoteRef | null = null;
  for (let i = 0; i < group.notes.length; i++) {
    const n = group.notes[i];
    if (n.flagLevel === 2) {
      if (!runStart) runStart = n;
    } else {
      if (runStart) {
        const prev = group.notes[i - 1];
        segments.push({
          level: 2,
          fromX: notePositions.get(runStart.event)!,
          toX: notePositions.get(prev.event)!,
          y: 1, // 1레벨보다 조금 더 안쪽 y
        });
        runStart = null;
      }
    }
  }
  if (runStart) {
    const last16 = group.notes[group.notes.length - 1];
    segments.push({
      level: 2,
      fromX: notePositions.get(runStart.event)!,
      toX: notePositions.get(last16.event)!,
      y: 1, // 동일한 2레벨 y
    });
  }

  return segments;
}

// beatIndex 는 0 ~ beatsPerBar-1
const SLOTS_PER_BEAT = 4; // 16분 기준 (4/4)

export function makeBeatGroupsFromBar(
  events: RhythmEvent[],
  beatsPerBar: number,
): BeatGroup[] {
  const groups: BeatGroup[] = Array.from({ length: beatsPerBar }, (_, i) => ({
    beatIndex: i,
    events: [],
  }));

  for (const e of events) {
    const beatIndex = Math.floor(e.start / SLOTS_PER_BEAT);
    if (beatIndex >= 0 && beatIndex < beatsPerBar) {
      groups[beatIndex].events.push(e);
    }
  }

  return groups;
}

export function computeNotePositions(
  events: RhythmEvent[],
  barX: number,
  barWidth: number,
  beatsPerBar: number,
): Map<RhythmEvent, number> {
  const positions = new Map<RhythmEvent, number>();
  const totalSlots = beatsPerBar * SLOTS_PER_BEAT;

  for (const e of events) {
    const ratio = e.start / totalSlots; // 0 ~ 1
    const x = barX + ratio * barWidth;
    positions.set(e, x);
  }

  return positions;
}
