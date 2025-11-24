목표

- 현재 사용 중인 리듬 데이터 구조(Bar / RhythmEvent)에 맞춰 “단계별 리듬 트레이닝 프리셋”을 만든다.
- 항상 4/4 박자이며, 한 마디는 16분 단위 격자 16칸(0~15)을 정확히 “꽉 채워야” 한다.
- 각 단계(Stage)는 “허용하는 리듬 요소(음표 길이/쉼표/점음표)”가 다르고, Bar 리스트로 연습 패턴을 제공한다.

기본 데이터 구조(이미 존재)

- RhythmEvent:
  - start: 마디 내 16분 단위 시작 위치 (0~15)
  - length: 16분 단위 길이. 4/4 한 마디 합은 항상 16이어야 함.
  - kind: 'note' | 'rest'
  - dots?: 점 개수(모양용). 시간 길이는 length로 이미 반영(예: 점8분 = length 3, dots 1)
- Bar:
  - beatsPerBar: 항상 4
  - events: RhythmEvent[] (start 기준 정렬하면 타임라인)

단계 정의용 타입 추가

```ts
import type { RhythmEvent } from './types';

export interface Bar {
  beatsPerBar: number; // 항상 4
  events: RhythmEvent[];
}

export interface TrainingStage {
  id: number;
  name: string;
  description: string;
  bars: Bar[];
}
```

중요 규칙

1. 4/4 고정
   - beatsPerBar는 항상 4.
   - 한 마디 총 길이는 16분 해상도 기준 16.
2. Bar는 반드시 “마디를 꽉 채워야 함”
   - events.reduce((sum, e)=>sum+e.length, 0) === 16
   - 점음표도 length에 포함된 실제 시간으로 계산.
     예) 점8분 = length 3, dots 1 (시간은 3칸, 모양은 dots로 점 표시)
3. 단계별 난이도
   - Stage 1: 4분(note/rest)만 사용 → 기본 박/온오프
   - Stage 2: 8분(note/rest) 추가 → 한 박 2등분
   - Stage 3: 16분(note/rest) 추가 → 한 박 4등분(박 경계 내에서만 복잡)
   - Stage 4: 점음표 도입(16분 해상도로 표현 가능한 점4분/점8분 등) → 3/6 단위 길이

프리셋 예시 코드 (1~4단계)

```ts
import { TrainingStage, Bar } from './trainingTypes';
import { RhythmEvent } from './types';

const beatsPerBar = 4;

// length 합이 16(=4/4 한 마디)인지 검증하는 헬퍼
function makeBar(events: RhythmEvent[]): Bar {
  const total = events.reduce((sum, e) => sum + e.length, 0);
  if (total !== 16) {
    throw new Error(`Invalid bar length: ${total} (expected 16)`);
  }
  return { beatsPerBar, events };
}

export const TRAINING_STAGES: TrainingStage[] = [
  // 1단계: 4분음표/4분쉼표만
  {
    id: 1,
    name: 'Stage 1 – Quarter Notes & Quarter Rests',
    description: '4분 음표/쉼표로 기본 박 감각과 온/오프를 연습.',
    bars: [
      makeBar([
        { start: 0, length: 4, kind: 'note' },
        { start: 4, length: 4, kind: 'note' },
        { start: 8, length: 4, kind: 'note' },
        { start: 12, length: 4, kind: 'note' },
      ]),
      makeBar([
        { start: 0, length: 4, kind: 'note' },
        { start: 4, length: 4, kind: 'rest' },
        { start: 8, length: 4, kind: 'note' },
        { start: 12, length: 4, kind: 'rest' },
      ]),
      makeBar([
        { start: 0, length: 4, kind: 'rest' },
        { start: 4, length: 4, kind: 'note' },
        { start: 8, length: 4, kind: 'rest' },
        { start: 12, length: 4, kind: 'note' },
      ]),
    ],
  },

  // 2단계: 8분 도입 (4분+8분 혼합)
  {
    id: 2,
    name: 'Stage 2 – Adding Eighth Notes',
    description: '4분에 8분(note/rest)을 섞어 한 박을 둘로 쪼개는 연습.',
    bars: [
      makeBar([
        { start: 0, length: 4, kind: 'note' },
        { start: 4, length: 2, kind: 'note' },
        { start: 6, length: 2, kind: 'note' },
        { start: 8, length: 4, kind: 'note' },
        { start: 12, length: 2, kind: 'note' },
        { start: 14, length: 2, kind: 'note' },
      ]),
      makeBar([
        { start: 0, length: 4, kind: 'note' },
        { start: 4, length: 2, kind: 'note' },
        { start: 6, length: 2, kind: 'rest' },
        { start: 8, length: 4, kind: 'rest' },
        { start: 12, length: 2, kind: 'rest' },
        { start: 14, length: 2, kind: 'note' },
      ]),
      makeBar([
        { start: 0, length: 2, kind: 'note' },
        { start: 2, length: 2, kind: 'note' },
        { start: 4, length: 2, kind: 'note' },
        { start: 6, length: 2, kind: 'rest' },
        { start: 8, length: 4, kind: 'note' },
        { start: 12, length: 2, kind: 'rest' },
        { start: 14, length: 2, kind: 'note' },
      ]),
    ],
  },

  // 3단계: 16분 도입 (박 안에서 4등분)
  {
    id: 3,
    name: 'Stage 3 – Introducing Sixteenth Notes',
    description: '16분(note/rest)로 한 박 4등분 리듬을 익힘(박 경계 내).',
    bars: [
      makeBar([
        // 1박: 16*4
        { start: 0, length: 1, kind: 'note' },
        { start: 1, length: 1, kind: 'note' },
        { start: 2, length: 1, kind: 'note' },
        { start: 3, length: 1, kind: 'note' },
        // 2박: 8 + 16 + 16
        { start: 4, length: 2, kind: 'note' },
        { start: 6, length: 1, kind: 'note' },
        { start: 7, length: 1, kind: 'note' },
        // 3박: 4분
        { start: 8, length: 4, kind: 'note' },
        // 4박: 4분
        { start: 12, length: 4, kind: 'note' },
      ]),
      makeBar([
        // 1박: 16,16,8쉼
        { start: 0, length: 1, kind: 'note' },
        { start: 1, length: 1, kind: 'note' },
        { start: 2, length: 2, kind: 'rest' },
        // 2박: 8 + 8쉼
        { start: 4, length: 2, kind: 'note' },
        { start: 6, length: 2, kind: 'rest' },
        // 3박: 16*4
        { start: 8, length: 1, kind: 'note' },
        { start: 9, length: 1, kind: 'note' },
        { start: 10, length: 1, kind: 'note' },
        { start: 11, length: 1, kind: 'note' },
        // 4박: 4분쉼
        { start: 12, length: 4, kind: 'rest' },
      ]),
    ],
  },

  // 4단계: 점음표 도입 (점8=3, 점4=6 등)
  {
    id: 4,
    name: 'Stage 4 – Dotted Rhythms',
    description: '점4분/점8분을 사용해 3·6 단위 길이와 빈틈 채우기를 연습.',
    bars: [
      // 점4(6)+8(2) | 점4(6)+8(2)
      makeBar([
        { start: 0, length: 6, kind: 'note', dots: 1 },
        { start: 6, length: 2, kind: 'note' },
        { start: 8, length: 6, kind: 'note', dots: 1 },
        { start: 14, length: 2, kind: 'note' },
      ]),
      // 각 박: 점8(3)+16(1)
      makeBar([
        { start: 0, length: 3, kind: 'note', dots: 1 },
        { start: 3, length: 1, kind: 'note' },
        { start: 4, length: 3, kind: 'note', dots: 1 },
        { start: 7, length: 1, kind: 'note' },
        { start: 8, length: 3, kind: 'note', dots: 1 },
        { start: 11, length: 1, kind: 'note' },
        { start: 12, length: 3, kind: 'note', dots: 1 },
        { start: 15, length: 1, kind: 'note' },
      ]),
      // 점4 + 8쉼 / 점8 + 16쉼 등 변형
      makeBar([
        { start: 0, length: 6, kind: 'note', dots: 1 },
        { start: 6, length: 2, kind: 'rest' },
        { start: 8, length: 3, kind: 'note', dots: 1 },
        { start: 11, length: 1, kind: 'rest' },
        { start: 12, length: 4, kind: 'rest' },
      ]),
    ],
  },
];
```

사용 흐름(개발 방향)

- UI에서 Stage 선택 → 해당 Stage.bars를 staff 위에 렌더링.
- 재생 시 Bar.events를 start 순으로 읽고, length만큼 시간을 진행하며 note/rest를 타임라인으로 출력.
- 점음표는 재생 길이=length로 처리하고, 점 표시=event.dots로 SVG에만 표현.

---

프리셋 단계별 난이도 구성

1. 1단계는 ‘박의 뼈대’만 남긴 단계입니다. 여기서는 4분 음표와 4분 쉼표만 사용합니다. 한 마디는 4개의 큰 덩어리로만 구성되니, 사용자는 ‘지금 소리가 나야 하는 박’과 ‘완전히 쉬는 박’을 명확히 구분하는 감각을 먼저 확보하게 됩니다. 연습 목적은 리듬을 쪼개는 것이 아니라, “4/4에서 박이 어떻게 흐르는지”를 몸에 넣는 것입니다. 따라서 패턴도 전부 4분으로 채운 마디, 음표–쉼표 교대, 쉼표–음표 교대처럼 아주 단순한 형태가 중심이 됩니다.
2. 2단계는 4분 기반 위에 8분을 ‘조심스럽게 섞는’ 단계입니다. 새로 허용되는 것은 8분 음표와 8분 쉼표이며, 핵심은 한 박을 정확히 둘로 나누는 감각을 익히는 것입니다. 다만 아직은 박 경계(1박 단위)를 넘어서는 복잡함은 금지합니다. 즉, 어떤 박이든 그 안에서만 8분으로 쪼개지고, 다음 박으로 이어지는 느낌은 만들지 않습니다. 사용자는 “박은 유지하되 박 안에서만 분할한다”는 원리를 안정적으로 배웁니다.
3. 3단계는 8분을 ‘주역’으로 올리되, 여전히 박 단위의 안정감을 유지하는 단계입니다. 2단계가 4분에 8분을 조금 끼워 넣는 느낌이었다면, 3단계는 한 마디를 대부분 8분들의 흐름으로 구성할 수 있도록 합니다. 대신 여전히 박 경계는 분명하게 느껴져야 합니다. 예컨대 8분이 연속되더라도 각 박이 어디서 시작되는지 체감이 흔들리지 않도록, 쉼표나 4분을 섞어 “박의 착지점”을 강조하는 편이 좋습니다. 이 단계의 목표는 8비트(“1&2&3&4&”)를 안정적으로 타게 하는 것입니다.
4. 4단계에서 처음으로 16분 해상도를 열어 줍니다. 이제 한 박을 네 조각(“1e&a”)으로 쪼갤 수 있는데, 아직은 ‘박 안에서만’ 복잡해지도록 제한합니다. 즉 16분 조합이 들어가더라도 반드시 해당 박의 4칸 안에서 끝나게 설계합니다. 16분이 전부 나오는 박, 8+16+16처럼 섞이는 박, 16분 쉼표가 끼어 있는 박 등으로 “한 박 내부의 미세한 타이밍”을 정확히 맞추는 훈련이 핵심이 됩니다.
5. 5단계는 16분을 본격적으로 운용하되, ‘쉼표의 위치’로 난이도를 올리는 단계입니다. 4단계가 16분 분할 그 자체를 익히는 시간이었다면, 5단계에서는 같은 16분 해상도 안에서 소리가 나는 위치와 쉬는 위치가 더 다양하게 바뀝니다. 예컨대 16분 쉼표가 박의 맨 앞에 오거나, 가운데에 오거나, 연속으로 오거나 하는 식으로 “빈 자리”가 리듬의 일부가 됩니다. 여기서 사용자는 단순히 빠르게 쪼개는 것이 아니라, “어느 칸을 치고 어느 칸을 비울지”를 정교하게 통제하는 감각을 얻게 됩니다.
6. 6단계는 ‘혼합 패턴의 밀도’를 높이는 단계입니다. 허용 요소 자체는 5단계와 같지만, 박 단위로 봤을 때 4분·8분·16분이 한 마디 안에서 더 자주 섞이고, 연속되는 16분 빔 구간과 8분 구간이 자연스럽게 교대합니다. 중요한 건 여전히 시간축은 16분 격자 위에서 정확히 채우되, 사용자가 “다양한 길이가 섞인 흐름을 끊김 없이 읽고 치는” 훈련을 하게 만드는 것입니다. 이 단계는 실전 리듬을 위한 ‘조합 적응’ 단계라고 보시면 됩니다.
7. 7단계에서 점음표를 도입합니다. 당신의 모델에서는 점음표가 “시간 길이로 이미 환산된 length(예: 점8분=3, 점4분=6)에 dots=1을 붙이는 방식”이므로 구현도 자연스럽습니다. 학습 관점에서 이 단계의 핵심은 ‘3 단위/6 단위의 비대칭 길이’가 만들어내는 느낌을 체화하는 것입니다. 점8분+16분(3+1), 점4분+8분(6+2)처럼 한 박 또는 두 박을 비대칭으로 채우는 패턴이 중심이 됩니다. 사용자는 여기서 처음으로 “박은 맞는데, 박 안의 길이가 균등하지 않은 리듬”을 경험합니다.
8. 8단계는 점음표를 ‘쉼표/혼합 패턴과 함께 실전적으로 운용’하는 종합 단계입니다. 7단계가 점 리듬을 이해하는 단계였다면, 8단계는 점 리듬이 실제 음악에서 어떻게 다른 분할(8·16분)과 섞여 흐름을 만드는지 익히는 단계입니다. 예컨대 점4분 뒤에 16분 둘이 붙는 구조, 점8분 뒤에 8분 쉼표가 오는 구조 등 “비대칭 길이 + 빈 자리 + 혼합 분할”이 동시에 들어갑니다. 다만 여전히 4/4 한 마디를 16칸으로 정확히 채우는 규칙은 유지되므로, 데이터 모델과 학습 체계가 끝까지 흔들리지 않습니다. 이 단계까지 오면 사용자는 대부분의 기본 리듬 조합을 당신의 프리셋 안에서 자연스럽게 소화할 수 있게 됩니다.

5~8단계 제약 기준 요약

- 5단계는 16분이 익숙해진 이후 쉼표 위치가 다양해지는 구간입니다. 학습자가 가장 힘들어하는 부분은 “자잘한 쉬었다-쳤다”가 과도하게 반복되면서 흐름이 끊기는 상황이므로, 쉼표는 이벤트 개수 기준으로 제한하는 것이 체감 난이도를 안정적으로 조절합니다. 반면 16분 밀도는 “어려운 박”의 개수로 느껴지니 계속 박 기준(maxDenseBeatsPerBar)으로 통제합니다.
- 6단계는 4·8·16분이 빠르게 섞이는 단계입니다. 여전히 16분 박이 많아지면 체감 난이도가 급등하므로 박 기준 제어를 유지하고, 쉼표는 이벤트 기준으로 “너무 자잘한 쉼표가 몰리는 경우”만 억제해 리듬 흐름이 자연스럽게 이어지도록 합니다.
- 7단계는 점음표가 처음 등장하는 단계이므로 점 리듬 제약을 반드시 박 기준(maxDottedBeatsPerBar)으로 설정해야 합니다. 점이 포함된 박이 최소 몇 개는 등장하게 하고, 동시에 과도하게 많아지지 않도록 상한을 둡니다. 쉼표는 느슨한 이벤트 제어, 16분은 중간 수준(예: 2박)으로 제한하면 점 리듬을 안정적으로 체화할 수 있습니다.
- 8단계는 점음표+쉼표+16분이 실전처럼 섞이는 종합 단계입니다. 점박은 박 기준으로 비중을 낮춰 양념처럼 섞이게 하고, 16분 박은 약간 더 넓게 허용합니다(예: 3박까지). 쉼표는 이벤트 기준 제한을 풀고, 대신 “쉼표가 포함된 박 수”만 박 기준으로 가볍게 제어하면 흐름이 무너지지 않으면서도 다양한 패턴을 노출할 수 있습니다.

| Stage | 16분 밀도 제약                           | 쉼표 제약                                                                                           | 점음표 제약                   |
| ----- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| 5     | 박 기준 (2박, `maxDenseBeatsPerBar = 2`) | 이벤트 기준 (1~5개)                                                                                 | 사용 안 함                    |
| 6     | 박 기준 (3박까지 허용)                   | 이벤트 기준 완만 (0~6개)                                                                            | 사용 안 함                    |
| 7     | 박 기준 (2박으로 축소)                   | 이벤트 기준 느슨 (0~5개)                                                                            | 박 기준 (최소 1박, 최대 2박)  |
| 8     | 박 기준 완화 (3박 허용)                  | 박 기준으로 가볍게 제어하거나 해제 (`maxRestBeatsPerBar` 필요 시 추가), 이벤트는 사실상 해제(0~7개) | 박 기준 (최대 1박, 양념 느낌) |

권장 수치 예시는 다음과 같습니다. (여전히 한 마디는 16칸을 정확히 채우며, `maxDenseBeatsPerBar`는 16분이 포함된 박 수, `maxRestBeatsPerBar`는 쉼표가 포함된 박 수, 쉼표 관련 이벤트 값은 쉼 이벤트 개수, 점음표 관련 값은 점이 포함된 박 수로 해석합니다.)

- Stage 5: `maxDenseBeatsPerBar = 2`, `minRestEventsPerBar = 1`, `maxRestEventsPerBar = 5`, `allowDots = false`, `maxDottedBeatsPerBar = 0`, `allowCrossBeatEvents = false`.
- Stage 6: `maxDenseBeatsPerBar = 3`, `minRestEventsPerBar = 0`, `maxRestEventsPerBar = 6`, `allowDots = false`, `maxDottedBeatsPerBar = 0`, `allowCrossBeatEvents = false`.
- Stage 7: `maxDenseBeatsPerBar = 2`, `minRestEventsPerBar = 0`, `maxRestEventsPerBar = 5`, `allowDots = true`, `minDottedBeatsPerBar = 1`, `maxDottedBeatsPerBar = 2`, `allowCrossBeatEvents = false`.
- Stage 8: `maxDenseBeatsPerBar = 3`, `minRestEventsPerBar = 0`, `maxRestEventsPerBar = 7`, `allowDots = true`, `minDottedBeatsPerBar = 0`, `maxDottedBeatsPerBar = 1`, `allowCrossBeatEvents = true` (단, beatPatterns에서 경계 넘김 패턴은 10~15% 정도만 포함).

> ⚠️ StageRules 값들이 서로 모순되면 `generateBarForStage`가 무한 루프에 빠질 수 있으니, 실제 구현에서는 최대 시도 횟수를 두거나 실패 케이스를 로깅해 디버깅하기 쉽게 만드는 것이 좋습니다.

이 8단계는 “새로운 요소를 조금씩 열어 주고, 그 요소가 충분히 자동화될 때까지 기존 요소와 섞어 반복하게 한다”는 원칙을 그대로 따른 구조입니다. 특히 당신이 이미 만든 16분 격자 기반 모델과 정합이 매우 좋아서, 단계별 프리셋은 단순히 “허용하는 length/kind/dots 범위와 대표 패턴의 밀도”만 조절하면 깔끔하게 확장됩니다.

---

각 단계 규칙만 바꿔 자동으로 마디를 생성하는 방식

요지: 현재의 16분 격자 기반 Bar/RhythmEvent 모델을 유지한 채, “단계별 규칙(StageRules) + 1박(4칸) 미니 패턴 라이브러리”를 조립해서 자동으로 4/4 한 마디(16칸)를 생성하는 구조를 쓰는 것이 가장 안정적입니다. 이렇게 하면 항상 마디가 꽉 차고, 초·중반 단계에서 박 경계를 넘지 않도록 학습 의도에 맞게 난이도를 자연스럽게 제어할 수 있습니다.

핵심 아이디어: 한 마디를 직접 16칸 백트래킹으로 채우기보다, “1박(4칸)을 완성하는 BeatPattern(미니 리듬)”들을 단계별로 미리 정의하고, 4개의 BeatPattern을 이어 붙여 마디를 만드는 방식입니다. 박 단위 조립을 쓰면 1~6단계처럼 ‘박 안에서만 복잡하게’ 만드는 정책을 자동으로 강제할 수 있고, 표기/학습 관점에서도 박의 착지감이 유지됩니다. (BeatPattern은 반드시 length 합이 4가 되도록 등록해야 하며, 실수 방지를 위해 `assertBeatPatternLength()` 같은 헬퍼를 두면 좋습니다.)

단계별 규칙 객체(StageRules): 각 단계는 (1) 허용되는 1박 패턴 후보군(beatPatterns)과 (2) 마디 전체에 대한 제약으로 정의합니다. 제약에는 예를 들어 16분이 많은 박의 최대 개수(maxDenseBeatsPerBar), 마디 내 쉼표 이벤트 최소/최대 개수(minRestEventsPerBar/maxRestEventsPerBar), 쉼표가 포함된 박 최대 개수(maxRestBeatsPerBar), 점음표 허용 여부 및 점음표가 포함된 박의 최소/최대 개수(allowDots, minDottedBeatsPerBar/maxDottedBeatsPerBar), 그리고 후반 단계에서만 박 경계 넘어가는 이벤트 허용(allowCrossBeatEvents) 같은 옵션이 들어갑니다. 점음표는 length에 이미 실제 시간(예: 점8분=3, 점4분=6)을 반영하고, dots는 “모양 표시용”으로만 쓰는 전제를 유지합니다.

> Stage 1~8의 허용 스펙(allowedLengths, allowDots 등)과 StageRules는 동일한 stageId로 매칭한다. StageRules 객체 이름도 `STAGE_X_RULES`처럼 stage 번호와 일치하게 관리하면 유지보수가 쉽다. Stage 5~8도 Stage 1~4와 같은 형식의 코드 예시를 추후 추가할 예정이다.

생성 로직 개요: seed 기반 PRNG로 매번 재현 가능한 난수를 만들고, 0~3 박(beatIndex) 각각에 대해 해당 단계의 beatPatterns에서 하나씩 뽑습니다. 뽑힌 패턴은 beatIndex \* 4를 시작점으로 cursor를 이동시키며 start를 자동 부여해 RhythmEvent 배열로 변환합니다. 이 4박 이벤트를 합쳐 한 마디 events를 만들고, validateBar에서 (a) length 합이 16인지, (b) 쉼표 개수 제약을 만족하는지, (c) 점박 개수/허용 여부를 만족하는지, (d) 16분 밀도 제한을 넘지 않는지, (e) allowCrossBeatEvents=false일 때 박 경계를 넘는 이벤트가 없는지 등을 검증합니다. 검증을 통과하면 Bar로 확정하고, 아니면 다시 뽑는 루프를 돌립니다.

학습 의도에 맞는 패턴/비중 운영: 1~3단계는 박 경계를 절대 넘지 않게 하고(allowCrossBeatEvents=false), 박 패턴도 4분 중심에서 8분 분할을 점차 늘리되 “박의 착지감”이 무너지지 않도록 쉬운 박 패턴을 일정 비율 섞습니다. 4~6단계는 16분 해상도 패턴을 박 안에서만 촘촘하게 늘리되, 마디 전체가 16분으로 도배되지 않도록 maxDenseBeatsPerBar 같은 제약으로 ‘쉬운 박’을 1~2박 남겨 박 감각을 유지합니다. 7~8단계는 점음표(3+1, 6+2 같은 비대칭 길이) 패턴을 충분히 노출시키되, 마디 내 점박 개수를 제한해 난이도 폭주를 막습니다. 필요하면 8단계에서만 allowCrossBeatEvents를 제한적으로 켜 “실전처럼 살짝 박을 넘는 느낌”을 허용할 수도 있지만, 16칸(4/4) 충만 규칙은 끝까지 고정합니다.

결론: 단계별로 “1박 패턴 후보군 + 마디 전역 제약”만 설계하면, 현재 모델을 전혀 바꾸지 않고도 난수/시드 기반으로 무한한 리듬 트레이닝 프리셋을 자동 생성할 수 있습니다. 다음 작업은 1~8단계 각각의 beatPatterns 초안을 실제 코드 배열로 작성하고, 단계별 비중(가중치)을 어떻게 줄지 결정하는 것입니다.

코드 예시

```ts
// ==============================
// stage-rules + generator example
// (single-file demo you can split later)
// ==============================

/** 16분 단위 길이. 4/4 한 마디는 총 16칸 */
export type DurationUnit = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
export type RhythmEventType = 'note' | 'rest';

export interface RhythmEvent {
  start: number; // 0 ~ 15
  length: DurationUnit; // 16분 단위
  kind: RhythmEventType; // note | rest
  dots?: 0 | 1 | 2; // 모양용 (시간은 length에 이미 반영)
}

export interface Bar {
  beatsPerBar: 4;
  events: RhythmEvent[]; // start 기준 정렬된 타임라인
}

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
// Seed PRNG + util
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

const SLOTS_PER_BEAT = 4; // 16분 기준 1박=4칸
const SLOTS_PER_BAR = 16; // 4/4 한 마디=16칸

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

  // TIP: 실제 구현에서는 최대 시도 횟수를 두고, 초과 시 예외를 던져 무한 루프를 방지한다.
  while (true) {
    const beatEvents = [0, 1, 2, 3].map((beatIndex) => {
      const pattern = pick(rules.beatPatterns, rand);
      return attachStartToBeatPattern(beatIndex, pattern);
    });

    const events = beatEvents.flat().sort((a, b) => a.start - b.start);

    if (validateBar(events, rules)) {
      return { beatsPerBar: 4, events };
    }
  }
}

// ------------------------------
// Stage rules examples (1~4단계만 샘플)
// - 확률 가중치는 패턴 중복으로 간단히 처리
// ------------------------------

/** Stage 1: 4분 note/rest만 */
export const STAGE_1_RULES: StageRules = {
  stageId: 1,
  name: 'Stage 1 – Quarter only',
  beatPatterns: [
    // 1박 = 4분 note
    [{ length: 4, kind: 'note' }],
    // 1박 = 4분 rest
    [{ length: 4, kind: 'rest' }],
  ],
  maxDenseBeatsPerBar: 0,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 4,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

/** Stage 2: 8분 분할 도입(박 안에서만) */
export const STAGE_2_RULES: StageRules = {
  stageId: 2,
  name: 'Stage 2 – Eighth intro',
  beatPatterns: [
    // 4분 note / rest도 유지(박 감각 유지용) → 확률을 높이고 싶으면 중복 추가
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],

    // 8 + 8
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    // 8 + 8rest
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'rest' },
    ],
    // 8rest + 8
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

/** Stage 3: 8분이 주역 + 간단 쉼표 위치 다양화 */
export const STAGE_3_RULES: StageRules = {
  stageId: 3,
  name: 'Stage 3 – Eighth dominant',
  beatPatterns: [
    // 8 + 8
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    // 8 + 8rest
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'rest' },
    ],
    // 8rest + 8
    [
      { length: 2, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    // 가끔 4분 note/rest로 착지감 제공
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

/** Stage 4: 16분 도입(박 안에서만) */
export const STAGE_4_RULES: StageRules = {
  stageId: 4,
  name: 'Stage 4 – Sixteenth intro',
  beatPatterns: [
    // 16 x4
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    // 8 + 16 + 16
    [
      { length: 2, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    // 16 + 16 + 8
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    // 16 + 8 + 16
    [
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
      { length: 1, kind: 'note' },
    ],
    // 쉼표 변형
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    // 가끔 8+8, 4분도 포함해서 박 감각 유지
    [
      { length: 2, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    [{ length: 4, kind: 'note' }],
    [{ length: 4, kind: 'rest' }],
  ],
  maxDenseBeatsPerBar: 2, // 마디 전체가 16분 도배되지 않게 제한
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 8,
  allowDots: false,
  maxDottedBeatsPerBar: 0,
  allowCrossBeatEvents: false,
};

/** Stage 5: 16분 쉼표 위치 다양화 */
export const STAGE_5_RULES: StageRules = {
  stageId: 5,
  name: 'Stage 5 – Sixteenth rests focus',
  beatPatterns: [
    // 16 + 16 + 8
    [
      { length: 1, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 2, kind: 'note' },
    ],
    // 8 + 16 + 16
    [
      { length: 2, kind: 'note' },
      { length: 1, kind: 'rest' },
      { length: 1, kind: 'note' },
    ],
    // 16 rest + 16 note + 8 note
    [
      { length: 1, kind: 'rest' },
      { length: 1, kind: 'note' },
      { length: 2, kind: 'note' },
    ],
    // 쉬운 박도 섞어서 감각 유지
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

/** Stage 6: 4/8/16 혼합 밀도 적응 */
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

/** Stage 7: 점음표 집중 */
export const STAGE_7_RULES: StageRules = {
  stageId: 7,
  name: 'Stage 7 – Dotted focus',
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

/** Stage 8: 종합 운용(경계 넘김 제한적 허용) */
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
    // 경계 넘김용 패턴 (길이 5 등)도 추후 낮은 확률로 추가 가능
  ],
  maxDenseBeatsPerBar: 3,
  minRestEventsPerBar: 0,
  maxRestEventsPerBar: 7,
  allowDots: true,
  minDottedBeatsPerBar: 0,
  maxDottedBeatsPerBar: 1,
  allowCrossBeatEvents: true,
};

// ------------------------------
// Usage example
// ------------------------------
const bar1 = generateBarForStage(STAGE_1_RULES, 123);
const bar2 = generateBarForStage(STAGE_2_RULES, 456);
const bar3 = generateBarForStage(STAGE_3_RULES, 789);
const bar4 = generateBarForStage(STAGE_4_RULES, 101112);
const bar5 = generateBarForStage(STAGE_5_RULES, 131415);
const bar6 = generateBarForStage(STAGE_6_RULES, 161718);
const bar7 = generateBarForStage(STAGE_7_RULES, 192021);
const bar8 = generateBarForStage(STAGE_8_RULES, 222324);

console.log('stage1', bar1);
console.log('stage2', bar2);
console.log('stage3', bar3);
console.log('stage4', bar4);
console.log('stage5', bar5);
console.log('stage6', bar6);
console.log('stage7', bar7);
console.log('stage8', bar8);

// 다음 단계(5~8단계)도 위 표/권장 수치에 맞춰 beatPatterns를 추가하고,
// StageRules의 min/max 값을 업데이트하면 동일한 방식으로 생성 가능합니다.
// (패턴에 length 합=4 검사를 추가하고, StageRules 충돌 시 예외를 던지도록 하면 안전합니다.)
```
