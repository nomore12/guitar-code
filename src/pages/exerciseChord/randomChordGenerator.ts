// 랜덤 코드 생성 유틸리티
import openChords from '../../data/openChords.json';
import {
  findChordEnhanced,
  generateChordFromTemplate,
  calculateChordDifficulty,
} from '../../utils/chordGenerator';

// 코드 인터페이스
interface ChordData {
  chord: string;
  fingers: number[][];
  mute: number[];
  flat: number;
}

// 코드 카테고리 정의
const CHORD_CATEGORIES = {
  // 오픈 포지션 코드 (기본 코드들)
  OPEN_POSITION: [
    'C',
    'G',
    'Am',
    'Em',
    'D',
    'F',
    'A',
    'E',
    'Dm',
    'Bm',
    'C7',
    'G7',
    'A7',
    'E7',
    'D7',
    'B7',
    'Am7',
    'Em7',
    'Dm7',
    'Cmaj7',
    'Gmaj7',
    'Amaj7',
    'Emaj7',
    'Dmaj7',
    'Fmaj7',
  ],

  // 바레 코드 (하이코드)
  BARRE_CHORDS: [
    'F',
    'Fm',
    'F7',
    'Fmaj7',
    'Bb',
    'Bbm',
    'Bb7',
    'Bbmaj7',
    'C#',
    'C#m',
    'C#7',
    'C#maj7',
    'Eb',
    'Ebm',
    'Eb7',
    'Ebmaj7',
    'F#',
    'F#m',
    'F#7',
    'F#maj7',
    'Ab',
    'Abm',
    'Ab7',
    'Abmaj7',
    'B',
    'Bm',
    'B7',
    'Bmaj7',
  ],

  // Diminished 코드
  DIMINISHED_CHORDS: [
    'Cdim',
    'Cdim7',
    'Ddim',
    'Ddim7',
    'Edim',
    'Edim7',
    'Fdim',
    'Fdim7',
    'Gdim',
    'Gdim7',
    'Adim',
    'Adim7',
    'Bdim',
    'Bdim7',
    'C#dim',
    'C#dim7',
    'Ebdim',
    'Ebdim7',
    'F#dim',
    'F#dim7',
    'Abdim',
    'Abdim7',
    'Bbdim',
    'Bbdim7',
  ],

  // Minor7b5 코드 (Half-diminished)
  MINOR7B5_CHORDS: [
    'Cm7b5',
    'Dm7b5',
    'Em7b5',
    'Fm7b5',
    'Gm7b5',
    'Am7b5',
    'Bm7b5',
    'C#m7b5',
    'Ebm7b5',
    'F#m7b5',
    'Abm7b5',
    'Bbm7b5',
  ],

  // Augmented 코드
  AUGMENTED_CHORDS: [
    'Caug',
    'Daug',
    'Eaug',
    'Faug',
    'Gaug',
    'Aaug',
    'Baug',
    'C#aug',
    'Ebaug',
    'F#aug',
    'Abaug',
    'Bbaug',
  ],

  // Sus4 코드
  SUS4_CHORDS: [
    'Csus4',
    'Dsus4',
    'Esus4',
    'Fsus4',
    'Gsus4',
    'Asus4',
    'Bsus4',
    'C#sus4',
    'Ebsus4',
    'F#sus4',
    'Absus4',
    'Bbsus4',
  ],

  // 6th 코드
  SIXTH_CHORDS: [
    'C6',
    'D6',
    'E6',
    'F6',
    'G6',
    'A6',
    'B6',
    'Am6',
    'Bm6',
    'Cm6',
    'Dm6',
    'Em6',
    'Fm6',
    'Gm6',
    'C#6',
    'Eb6',
    'F#6',
    'Ab6',
    'Bb6',
    'C#m6',
    'Ebm6',
    'F#m6',
    'Abm6',
    'Bbm6',
  ],
};

// 코드 생성 모드
export enum ChordGenerationMode {
  MIXED = 'mixed', // 혼합 (기본)
  BEGINNER = 'beginner', // 초보자용 (주로 오픈 포지션)
  INTERMEDIATE = 'intermediate', // 중급자용 (바레 코드 포함)
  ADVANCED = 'advanced', // 고급자용 (특수 코드 포함)
}

// 난이도별 코드 분포 설정
const DIFFICULTY_DISTRIBUTION = {
  [ChordGenerationMode.MIXED]: {
    openPosition: 0.4, // 40%
    barreChords: 0.4, // 40%
    diminishedChords: 0.05, // 5%
    minor7b5Chords: 0.04, // 4%
    augmentedChords: 0.03, // 3%
    sus4Chords: 0.05, // 5%
    sixthChords: 0.03, // 3%
  },
  [ChordGenerationMode.BEGINNER]: {
    openPosition: 0.8, // 80%
    barreChords: 0.15, // 15%
    diminishedChords: 0.0, // 0%
    minor7b5Chords: 0.0, // 0%
    augmentedChords: 0.0, // 0%
    sus4Chords: 0.05, // 5%
    sixthChords: 0.0, // 0%
  },
  [ChordGenerationMode.INTERMEDIATE]: {
    openPosition: 0.3, // 30%
    barreChords: 0.6, // 60%
    diminishedChords: 0.03, // 3%
    minor7b5Chords: 0.02, // 2%
    augmentedChords: 0.02, // 2%
    sus4Chords: 0.03, // 3%
    sixthChords: 0.0, // 0%
  },
  [ChordGenerationMode.ADVANCED]: {
    openPosition: 0.2, // 20%
    barreChords: 0.4, // 40%
    diminishedChords: 0.1, // 10%
    minor7b5Chords: 0.08, // 8%
    augmentedChords: 0.08, // 8%
    sus4Chords: 0.07, // 7%
    sixthChords: 0.07, // 7%
  },
};

// 배열에서 랜덤 요소 선택
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 배열에서 중복 없이 n개 요소 선택
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// openChords.json에서 코드 데이터 가져오기
function getOpenChordData(chordName: string): ChordData | null {
  const chord = (openChords as Record<string, any>)[chordName];
  if (!chord) return null;

  return {
    chord: chord.chord,
    fingers: chord.fingers,
    mute: chord.mute || [],
    flat: chord.flat || 1,
  };
}

// 코드 생성기를 사용해서 코드 데이터 생성
function generateChordData(chordName: string): ChordData | null {
  try {
    // 먼저 오픈 코드에서 찾기
    const openChord = getOpenChordData(chordName);
    if (openChord) return openChord;

    // 코드 생성기 사용
    const positions = findChordEnhanced(chordName, true);
    if (positions.length === 0) return null;

    // 가장 쉬운 포지션 선택 (또는 랜덤)
    const selectedPosition = positions.reduce((easiest, current) =>
      calculateChordDifficulty(current) < calculateChordDifficulty(easiest)
        ? current
        : easiest,
    );

    return {
      chord: selectedPosition.chord,
      fingers: selectedPosition.fingers,
      mute: selectedPosition.mute,
      flat: selectedPosition.flat,
    };
  } catch (error) {
    console.warn(`코드 생성 실패: ${chordName}`, error);
    return null;
  }
}

// 카테고리별 코드 생성
function generateChordsFromCategory(
  category: string[],
  count: number,
  usedChords: Set<string>,
): ChordData[] {
  const results: ChordData[] = [];
  const availableChords = category.filter((chord) => !usedChords.has(chord));

  if (availableChords.length === 0) return results;

  const selectedChords = getRandomElements(availableChords, count);

  for (const chordName of selectedChords) {
    const chordData = generateChordData(chordName);
    if (chordData) {
      results.push(chordData);
      usedChords.add(chordName);
    }
  }

  return results;
}

// 코드 카테고리 타입 정의
export interface ChordCategories {
  openPosition: boolean;
  barreChords: boolean;
  diminishedChords: boolean;
  minor7b5Chords: boolean;
  augmentedChords: boolean;
  sus4Chords: boolean;
  sixthChords: boolean;
}

// 타입 export 확인용
export type { ChordCategories as ChordCategoriesType };

// 선택된 카테고리에 따른 랜덤 코드 생성
export function generateRandomChordsWithCategories(
  categories: ChordCategories,
): ChordData[] {
  const totalChords = 16;
  const selectedCategories = Object.entries(categories).filter(
    ([, enabled]) => enabled,
  );

  if (selectedCategories.length === 0) {
    // 아무것도 선택되지 않았다면 모든 카테고리 사용
    return generateRandomChords(ChordGenerationMode.MIXED);
  }

  const chordsPerCategory = Math.floor(totalChords / selectedCategories.length);
  const remainder = totalChords % selectedCategories.length;

  const usedChords = new Set<string>();
  const results: ChordData[] = [];

  // 각 카테고리에서 균등하게 코드 생성
  selectedCategories.forEach(([categoryName], index) => {
    const count = chordsPerCategory + (index < remainder ? 1 : 0);
    let categoryChords: string[] = [];

    switch (categoryName) {
      case 'openPosition':
        categoryChords = CHORD_CATEGORIES.OPEN_POSITION;
        break;
      case 'barreChords':
        categoryChords = CHORD_CATEGORIES.BARRE_CHORDS;
        break;
      case 'diminishedChords':
        categoryChords = CHORD_CATEGORIES.DIMINISHED_CHORDS;
        break;
      case 'minor7b5Chords':
        categoryChords = CHORD_CATEGORIES.MINOR7B5_CHORDS;
        break;
      case 'augmentedChords':
        categoryChords = CHORD_CATEGORIES.AUGMENTED_CHORDS;
        break;
      case 'sus4Chords':
        categoryChords = CHORD_CATEGORIES.SUS4_CHORDS;
        break;
      case 'sixthChords':
        categoryChords = CHORD_CATEGORIES.SIXTH_CHORDS;
        break;
    }

    const generatedChords = generateChordsFromCategory(
      categoryChords,
      count,
      usedChords,
    );
    results.push(...generatedChords);
  });

  // 부족한 경우 선택된 카테고리에서 추가 채우기
  while (results.length < totalChords) {
    const allSelectedChords: string[] = [];

    if (categories.openPosition)
      allSelectedChords.push(...CHORD_CATEGORIES.OPEN_POSITION);
    if (categories.barreChords)
      allSelectedChords.push(...CHORD_CATEGORIES.BARRE_CHORDS);
    if (categories.diminishedChords)
      allSelectedChords.push(...CHORD_CATEGORIES.DIMINISHED_CHORDS);
    if (categories.minor7b5Chords)
      allSelectedChords.push(...CHORD_CATEGORIES.MINOR7B5_CHORDS);
    if (categories.augmentedChords)
      allSelectedChords.push(...CHORD_CATEGORIES.AUGMENTED_CHORDS);
    if (categories.sus4Chords)
      allSelectedChords.push(...CHORD_CATEGORIES.SUS4_CHORDS);
    if (categories.sixthChords)
      allSelectedChords.push(...CHORD_CATEGORIES.SIXTH_CHORDS);

    const availableChords = allSelectedChords.filter(
      (chord) => !usedChords.has(chord),
    );
    if (availableChords.length === 0) break;

    const chordName = getRandomElement(availableChords);
    const chordData = generateChordData(chordName);

    if (chordData) {
      results.push(chordData);
      usedChords.add(chordName);
    }
  }

  // 랜덤 섞기
  return results.sort(() => 0.5 - Math.random());
}

// 16개 랜덤 코드 생성 메인 함수 (기존 호환성 유지)
export function generateRandomChords(
  mode: ChordGenerationMode = ChordGenerationMode.MIXED,
): ChordData[] {
  const distribution = DIFFICULTY_DISTRIBUTION[mode];
  const totalChords = 16;

  // 카테고리별 개수 계산
  const openCount = Math.round(totalChords * distribution.openPosition);
  const barreCount = Math.round(totalChords * distribution.barreChords);
  const diminishedCount = Math.round(
    totalChords * distribution.diminishedChords,
  );
  const minor7b5Count = Math.round(totalChords * distribution.minor7b5Chords);
  const augmentedCount = Math.round(totalChords * distribution.augmentedChords);
  const sus4Count = Math.round(totalChords * distribution.sus4Chords);
  const sixthCount = Math.round(totalChords * distribution.sixthChords);

  const usedChords = new Set<string>();
  const results: ChordData[] = [];

  // 1. 오픈 포지션 코드 생성
  if (openCount > 0) {
    const openChords = generateChordsFromCategory(
      CHORD_CATEGORIES.OPEN_POSITION,
      openCount,
      usedChords,
    );
    results.push(...openChords);
  }

  // 2. 바레 코드 생성
  if (barreCount > 0) {
    const barreChords = generateChordsFromCategory(
      CHORD_CATEGORIES.BARRE_CHORDS,
      barreCount,
      usedChords,
    );
    results.push(...barreChords);
  }

  // 3. Diminished 코드 생성
  if (diminishedCount > 0) {
    const diminishedChords = generateChordsFromCategory(
      CHORD_CATEGORIES.DIMINISHED_CHORDS,
      diminishedCount,
      usedChords,
    );
    results.push(...diminishedChords);
  }

  // 4. Minor7b5 코드 생성
  if (minor7b5Count > 0) {
    const minor7b5Chords = generateChordsFromCategory(
      CHORD_CATEGORIES.MINOR7B5_CHORDS,
      minor7b5Count,
      usedChords,
    );
    results.push(...minor7b5Chords);
  }

  // 5. Augmented 코드 생성
  if (augmentedCount > 0) {
    const augmentedChords = generateChordsFromCategory(
      CHORD_CATEGORIES.AUGMENTED_CHORDS,
      augmentedCount,
      usedChords,
    );
    results.push(...augmentedChords);
  }

  // 6. Sus4 코드 생성
  if (sus4Count > 0) {
    const sus4Chords = generateChordsFromCategory(
      CHORD_CATEGORIES.SUS4_CHORDS,
      sus4Count,
      usedChords,
    );
    results.push(...sus4Chords);
  }

  // 7. 6th 코드 생성
  if (sixthCount > 0) {
    const sixthChords = generateChordsFromCategory(
      CHORD_CATEGORIES.SIXTH_CHORDS,
      sixthCount,
      usedChords,
    );
    results.push(...sixthChords);
  }

  // 8. 부족한 경우 추가 채우기
  while (results.length < totalChords) {
    const allAvailableChords = [
      ...CHORD_CATEGORIES.OPEN_POSITION,
      ...CHORD_CATEGORIES.BARRE_CHORDS,
      ...CHORD_CATEGORIES.DIMINISHED_CHORDS,
      ...CHORD_CATEGORIES.MINOR7B5_CHORDS,
      ...CHORD_CATEGORIES.AUGMENTED_CHORDS,
      ...CHORD_CATEGORIES.SUS4_CHORDS,
      ...CHORD_CATEGORIES.SIXTH_CHORDS,
    ].filter((chord) => !usedChords.has(chord));

    if (allAvailableChords.length === 0) break;

    const chordName = getRandomElement(allAvailableChords);
    const chordData = generateChordData(chordName);

    if (chordData) {
      results.push(chordData);
      usedChords.add(chordName);
    }
  }

  // 5. 랜덤 섞기
  return results.sort(() => 0.5 - Math.random());
}

// 특정 키의 코드만 생성 (예: C키의 코드들)
export function generateChordsInKey(key: string): ChordData[] {
  const keyChords = {
    C: [
      'C',
      'Dm',
      'Em',
      'F',
      'G',
      'Am',
      'Bdim',
      'C7',
      'Dm7',
      'Em7',
      'Fmaj7',
      'G7',
      'Am7',
      'Bm7b5',
      'Cmaj7',
      'Csus4',
    ],
    G: [
      'G',
      'Am',
      'Bm',
      'C',
      'D',
      'Em',
      'F#dim',
      'G7',
      'Am7',
      'Bm7',
      'Cmaj7',
      'D7',
      'Em7',
      'F#m7b5',
      'Gmaj7',
      'Gsus4',
    ],
    D: [
      'D',
      'Em',
      'F#m',
      'G',
      'A',
      'Bm',
      'C#dim',
      'D7',
      'Em7',
      'F#m7',
      'Gmaj7',
      'A7',
      'Bm7',
      'C#m7b5',
      'Dmaj7',
      'Dsus4',
    ],
    A: [
      'A',
      'Bm',
      'C#m',
      'D',
      'E',
      'F#m',
      'G#dim',
      'A7',
      'Bm7',
      'C#m7',
      'Dmaj7',
      'E7',
      'F#m7',
      'G#m7b5',
      'Amaj7',
      'Asus4',
    ],
    E: [
      'E',
      'F#m',
      'G#m',
      'A',
      'B',
      'C#m',
      'D#dim',
      'E7',
      'F#m7',
      'G#m7',
      'Amaj7',
      'B7',
      'C#m7',
      'D#m7b5',
      'Emaj7',
      'Esus4',
    ],
    F: [
      'F',
      'Gm',
      'Am',
      'Bb',
      'C',
      'Dm',
      'Edim',
      'F7',
      'Gm7',
      'Am7',
      'Bbmaj7',
      'C7',
      'Dm7',
      'Em7b5',
      'Fmaj7',
      'Fsus4',
    ],
  };

  const chords = keyChords[key as keyof typeof keyChords] || keyChords['C'];
  const selectedChords = getRandomElements(chords, 16);
  const usedChords = new Set<string>();
  const results: ChordData[] = [];

  for (const chordName of selectedChords) {
    if (usedChords.has(chordName)) continue;

    const chordData = generateChordData(chordName);
    if (chordData) {
      results.push(chordData);
      usedChords.add(chordName);
    }
  }

  // 부족한 경우 랜덤으로 채우기
  while (results.length < 16) {
    const randomChords = generateRandomChords(ChordGenerationMode.MIXED);
    results.push(...randomChords.slice(0, 16 - results.length));
  }

  return results.slice(0, 16);
}

// 코드 생성 프리셋
export const CHORD_PRESETS = {
  beginner: () => generateRandomChords(ChordGenerationMode.BEGINNER),
  intermediate: () => generateRandomChords(ChordGenerationMode.INTERMEDIATE),
  advanced: () => generateRandomChords(ChordGenerationMode.ADVANCED),
  mixed: () => generateRandomChords(ChordGenerationMode.MIXED),
  keyOfC: () => generateChordsInKey('C'),
  keyOfG: () => generateChordsInKey('G'),
  keyOfD: () => generateChordsInKey('D'),
  keyOfA: () => generateChordsInKey('A'),
  keyOfE: () => generateChordsInKey('E'),
  keyOfF: () => generateChordsInKey('F'),
};
