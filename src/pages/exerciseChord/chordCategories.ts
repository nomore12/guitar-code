// 코드 카테고리 정의
export const CHORD_CATEGORIES = {
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

  // 특수 7th 코드 (5번줄, 6번줄 루트)
  SEVENTH_CHORDS: [
    'C7',
    'Cmaj7',
    'Cm7',
    'Cminmaj7',
    'D7',
    'Dmaj7',
    'Dm7',
    'Dminmaj7',
    'E7',
    'Emaj7',
    'Em7',
    'Eminmaj7',
    'F7',
    'Fmaj7',
    'Fm7',
    'Fminmaj7',
    'G7',
    'Gmaj7',
    'Gm7',
    'Gminmaj7',
    'A7',
    'Amaj7',
    'Am7',
    'Aminmaj7',
    'B7',
    'Bmaj7',
    'Bm7',
    'Bminmaj7',
    'C#7',
    'C#maj7',
    'C#m7',
    'C#minmaj7',
    'Eb7',
    'Ebmaj7',
    'Ebm7',
    'Ebminmaj7',
    'F#7',
    'F#maj7',
    'F#m7',
    'F#minmaj7',
    'Ab7',
    'Abmaj7',
    'Abm7',
    'Abminmaj7',
    'Bb7',
    'Bbmaj7',
    'Bbm7',
    'Bbminmaj7',
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
export const DIFFICULTY_DISTRIBUTION = {
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
