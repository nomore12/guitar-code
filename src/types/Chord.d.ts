declare interface ChordProps {
  chord: string;
  fingers: number[][];
  mute: number[];
  flat: number;
}

declare interface ChordsDataProps {
  [key: string]: ChordProps;
}
