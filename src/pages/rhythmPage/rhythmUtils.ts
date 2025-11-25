import {
  BeamGroup,
  BeatGroup,
  BeamNoteRef,
  RhythmEvent,
  BeamSegment,
} from './types';
import {
  SLOT_HIGHLIGHT_MARGIN,
  SLOT_HIGHLIGHT_EXTRA_MARGIN,
} from './layoutConstants';

export const SLOTS_PER_BEAT = 4; // 16분 기준 (4/4)

export function computeEffectiveLength(event: RhythmEvent): number {
  if (!event.dots) return event.length;
  let total = event.length;
  let dotValue = event.length / 2;
  for (let i = 0; i < event.dots; i++) {
    total += dotValue;
    dotValue /= 2;
  }
  return total;
}

export function computeFlagLevel(event: RhythmEvent): number {
  const effectiveLength = computeEffectiveLength(event);
  if (effectiveLength >= SLOTS_PER_BEAT) return 0; // 4분 이상
  if (effectiveLength >= 2) return 1; // 8분 계열 (2~3칸)
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
  const STUB_LENGTH = 12;

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
  let runStartIndex = -1;

  for (let i = 0; i < group.notes.length; i++) {
    const n = group.notes[i];
    if (n.flagLevel === 2) {
      if (!runStart) {
        runStart = n;
        runStartIndex = i;
      }
    } else {
      if (runStart) {
        const prev = group.notes[i - 1];
        const startX = notePositions.get(runStart.event)!;
        const endX = notePositions.get(prev.event)!;

        if (runStart === prev) {
          // 단독 16분음표: 스터브(Stub) 생성
          if (runStartIndex === 0) {
            // 그룹의 첫 음표면 오른쪽으로
            segments.push({
              level: 2,
              fromX: startX,
              toX: startX + STUB_LENGTH,
              y: 1,
            });
          } else {
            // 그 외(중간이나 끝)면 왼쪽으로
            segments.push({
              level: 2,
              fromX: startX - STUB_LENGTH,
              toX: startX,
              y: 1,
            });
          }
        } else {
          // 연속된 16분음표
          segments.push({ level: 2, fromX: startX, toX: endX, y: 1 });
        }
        runStart = null;
      }
    }
  }
  if (runStart) {
    const last16 = group.notes[group.notes.length - 1];
    const startX = notePositions.get(runStart.event)!;
    const endX = notePositions.get(last16.event)!;

    if (runStart === last16) {
      // 단독 16분음표
      if (runStartIndex === 0) {
        segments.push({
          level: 2,
          fromX: startX,
          toX: startX + STUB_LENGTH,
          y: 1,
        });
      } else {
        segments.push({
          level: 2,
          fromX: startX - STUB_LENGTH,
          toX: startX,
          y: 1,
        });
      }
    } else {
      segments.push({ level: 2, fromX: startX, toX: endX, y: 1 });
    }
  }

  return segments;
}

// beatIndex 는 0 ~ beatsPerBar-1
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

export function computeEventRenderX(
  event: RhythmEvent,
  beatBaseX: number,
  beatWidth: number,
): number {
  const effectiveBeatWidth = Math.max(beatWidth - SLOT_HIGHLIGHT_MARGIN * 2, 0);
  const slotInBeat = event.start % SLOTS_PER_BEAT;
  const centerSlot = slotInBeat + computeEffectiveLength(event) / 2;
  const ratio = Math.min(centerSlot / SLOTS_PER_BEAT, 1);
  const innerMargin = SLOT_HIGHLIGHT_MARGIN + SLOT_HIGHLIGHT_EXTRA_MARGIN;
  const innerWidth = Math.max(
    effectiveBeatWidth - SLOT_HIGHLIGHT_EXTRA_MARGIN * 2,
    0,
  );
  return beatBaseX + innerMargin + ratio * innerWidth;
}
