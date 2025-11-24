import { Bar, TrainingStage, StageId } from './types';

const beatsPerBar = 4;

const stage1Bars: Bar[] = [
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'rest' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 4, kind: 'rest' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'rest' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 4, kind: 'rest' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 4, kind: 'rest' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'rest' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 4, kind: 'rest' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'rest' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 4, kind: 'rest' },
      { start: 8, length: 4, kind: 'rest' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
];

const stage2Bars: Bar[] = [
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 2, kind: 'note' },
      { start: 6, length: 2, kind: 'note' },
      { start: 8, length: 4, kind: 'note' },
      { start: 12, length: 2, kind: 'note' },
      { start: 14, length: 2, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 2, kind: 'note' },
      { start: 6, length: 2, kind: 'rest' },
      { start: 8, length: 4, kind: 'rest' },
      { start: 12, length: 2, kind: 'rest' },
      { start: 14, length: 2, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 2, kind: 'note' },
      { start: 2, length: 2, kind: 'rest' },
      { start: 4, length: 2, kind: 'note' },
      { start: 6, length: 2, kind: 'note' },
      { start: 8, length: 2, kind: 'rest' },
      { start: 10, length: 2, kind: 'note' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 2, kind: 'note' },
      { start: 2, length: 2, kind: 'note' },
      { start: 4, length: 4, kind: 'note' },
      { start: 8, length: 2, kind: 'note' },
      { start: 10, length: 2, kind: 'rest' },
      { start: 12, length: 2, kind: 'note' },
      { start: 14, length: 2, kind: 'note' },
    ],
  },
];

const stage3Bars: Bar[] = [
  {
    beatsPerBar,
    events: [
      { start: 0, length: 2, kind: 'note' },
      { start: 2, length: 2, kind: 'note' },
      { start: 4, length: 2, kind: 'note' },
      { start: 6, length: 2, kind: 'note' },
      { start: 8, length: 2, kind: 'note' },
      { start: 10, length: 2, kind: 'note' },
      { start: 12, length: 2, kind: 'rest' },
      { start: 14, length: 2, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 2, kind: 'note' },
      { start: 2, length: 2, kind: 'rest' },
      { start: 4, length: 2, kind: 'note' },
      { start: 6, length: 2, kind: 'note' },
      { start: 8, length: 2, kind: 'note' },
      { start: 10, length: 2, kind: 'rest' },
      { start: 12, length: 2, kind: 'note' },
      { start: 14, length: 2, kind: 'note' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 4, kind: 'note' },
      { start: 4, length: 2, kind: 'note' },
      { start: 6, length: 2, kind: 'note' },
      { start: 8, length: 2, kind: 'rest' },
      { start: 10, length: 2, kind: 'note' },
      { start: 12, length: 2, kind: 'note' },
      { start: 14, length: 2, kind: 'rest' },
    ],
  },
  {
    beatsPerBar,
    events: [
      { start: 0, length: 2, kind: 'note' },
      { start: 2, length: 2, kind: 'note' },
      { start: 4, length: 2, kind: 'rest' },
      { start: 6, length: 2, kind: 'note' },
      { start: 8, length: 2, kind: 'note' },
      { start: 10, length: 2, kind: 'note' },
      { start: 12, length: 4, kind: 'note' },
    ],
  },
];

export const RHYTHM_PRESETS: TrainingStage[] = [
  {
    id: 1,
    name: 'Stage 1 – Quarter focus',
    description: '4분 음표/쉼표로 기본 박 감각과 온/오프를 연습합니다.',
    bars: stage1Bars,
  },
  {
    id: 2,
    name: 'Stage 2 – Adding eighths',
    description: '8분 음표/쉼표를 박 안에서만 섞어 한 박 2등분을 익힙니다.',
    bars: stage2Bars,
  },
  {
    id: 3,
    name: 'Stage 3 – Eighth dominant',
    description: '8분 리듬을 중심으로 다양한 쉼표 위치를 실전처럼 경험합니다.',
    bars: stage3Bars,
  },
];

export const getStagePreset = (stageId: StageId): TrainingStage | undefined =>
  RHYTHM_PRESETS.find((stage) => stage.id === stageId);
