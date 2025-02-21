export function lineToNumber(line: number) {
  if (line === 6) {
    return 1;
  } else if (line === 5) {
    return 2;
  } else if (line === 4) {
    return 3;
  } else if (line === 3) {
    return 4;
  } else if (line === 2) {
    return 5;
  } else if (line === 1) {
    return 6;
  }
  return 1;
}

// 노트명을 반음(semitone) 숫자로 매핑 (C=0, C#=1, …, B=11)
const NOTE_TO_SEMITONE: { [note: string]: number } = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

export interface ChordShape {
  chord: string; // 예: "C"
  // fingers: [string, fret] 순서 — 예: [5,15]는 5번 줄의 15번 프렛
  fingers: [number, number][];
  // mute: 연주하지 않을 줄
  mute: number[];
  // flat: 해당 모양에서 눌러야 하는 프렛들 중 가장 낮은 프렛 번호 (바레 위치 기준)
  flat: number;
}

/**
 * 해당 줄의 open 음(openSemitone)에서 목표 음(targetSemitone)을 내기 위한 최소 프렛을 계산합니다.
 * 단, minFret 이상이어야 하며, open으로 낼 수 있더라도 (barre 모양에서는) minFret 조건을 만족해야 합니다.
 *
 * 예를 들어, 5번 줄의 open 음 A(9)에서 C(0)를 내려면:
 *  base = (0 - 9 + 12) % 12 = 3.
 *  만약 minFret가 0이면 3번 프렛, minFret가 1 이상이면 3이 1 이상이므로 그대로 3을,
 *  단 open인 경우(계산 결과 0)가 minFret > 0이면 12를 사용하도록 합니다.
 *
 * @param openSemitone 해당 줄의 open 음 semitone
 * @param targetSemitone 목표 음 semitone (예, C → 0)
 * @param minFret 최소 허용 프렛 번호
 * @returns {number} 계산된 프렛 번호
 */
function getFret(
  openSemitone: number,
  targetSemitone: number,
  minFret: number,
): number {
  let base = (targetSemitone - openSemitone + 12) % 12;
  // barre 모양(즉, minFret > 0)에서는 open으로 낼 수 있어도 안 되므로
  if (base === 0 && minFret > 0) {
    base = 12;
  }
  let fret = base;
  while (fret < minFret) {
    fret += 12;
  }
  return fret;
}

/**
 * 5번, 4번, 3번 줄에서 사용할 경우에 대해,
 * 각 줄의 open 음과 목표 chord tone(1도, 3도, 5도)을 비교하여
 * minFret 이상의 조건을 만족하는 프렛 번호를 결정하고, [string, fret] 형태의 배열로 반환합니다.
 *
 * @param chordTones  순서대로 [root, major 3rd, perfect 5th]의 semitone 값 배열
 * @param minFret      각 줄에서 사용할 최소 프렛 번호 (오픈포지션이면 0, barre 모양이면 1 이상)
 * @returns {[number, number][]} 각 줄에 대한 [string, fret] 쌍 배열 (여기서 string은 5,4,3)
 */
function buildFingers(
  chordTones: number[],
  minFret: number,
): [number, number][] {
  // 사용할 줄 번호: 5번, 4번, 3번
  const strings = [5, 4, 3];
  // 해당 줄의 open 음 (표준 튜닝 기준: 5:A, 4:D, 3:G)
  const openSemitones = [
    NOTE_TO_SEMITONE['A'],
    NOTE_TO_SEMITONE['D'],
    NOTE_TO_SEMITONE['G'],
  ];

  return openSemitones.map((open, i) => {
    const fret = getFret(open, chordTones[i], minFret);
    return [strings[i], fret] as [number, number];
  });
}

/**
 * 메이저 코드(예, "C")를 입력받아, 0프렛(오픈포지션)부터
 * 후보로 정한 몇 가지 minFret 값(예, 0, 1, 3, 4)을 사용하여
 * 각 위치에서 코드를 내기 위한 finger 조합을 계산합니다.
 *
 * 만약 오픈포지션(0번 후보)라면 sample처럼 뮤트할 줄(예, 6번)을 지정하고,
 * barre 모양(0보다 큰 후보)라면 뮤트 없이 반환합니다.
 *
 * 후보마다 계산된 finger 조합이 중복되지 않으면 최종 결과에 포함시킵니다.
 *
 * @param chord 메이저 코드 (예, "C")
 * @returns {ChordShape[]} 계산된 chord shape 배열
 */
export function generateMajorChordShapes(chord: string): ChordShape[] {
  // 메이저 코드 구성음: root, major 3rd, perfect 5th
  const rootSemitone = NOTE_TO_SEMITONE[chord];
  const chordTones = [
    rootSemitone,
    (rootSemitone + 4) % 12,
    (rootSemitone + 7) % 12,
  ];

  // 여기서는 후보로 minFret 값을 0 (오픈), 1, 3, 4를 사용합니다.
  const candidates = [0, 1, 3, 4];
  const shapes: ChordShape[] = [];
  const seen = new Set<string>(); // 중복 배제를 위해 finger 조합을 문자열로 저장

  for (const candidate of candidates) {
    const fingers = buildFingers(chordTones, candidate);
    const key = JSON.stringify(fingers);
    if (seen.has(key)) continue;
    seen.add(key);

    const flat = Math.min(...fingers.map(([str, fret]) => fret));
    shapes.push({
      chord,
      fingers,
      mute: candidate === 0 ? [6] : [],
      flat,
    });
  }
  return shapes;
}

// 예시 호출: 메이저 코드 "C"를 입력하면
const chordShapes = generateMajorChordShapes('C');
console.log(JSON.stringify(chordShapes, null, 4));
