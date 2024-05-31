declare interface Chord {
  chord: string;
  fingers: number[][];
  mute: number[];
  flat: number;
}

declare interface ChordsData {
  [key: string]: Chord;
}
