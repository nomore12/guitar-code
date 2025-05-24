import React from 'react';

interface NoteMarkerProps {
  fret: number; // 프렛 번호 (1 ~ 12)
  lineNumber: number; // 줄 번호 (1 ~ 6, 1번줄이 하이 E) - 기존 string에서 이름 변경
  calculatedY: number; // Flatboard에서 계산된 정확한 y 좌표
  note: string; // 출력할 음계
  color?: string;
  handleNodeClick?: (node: ChromaticNote) => void;
}

const NoteMarker: React.FC<NoteMarkerProps> = ({
  fret,
  lineNumber, // string 대신 사용
  calculatedY, // 이 값을 사용
  note,
  color,
  handleNodeClick,
}) => {
  // 프렛보드 설정값 (Flatboard와 중복되므로, cx도 전달받는 것이 이상적)
  const fretboardWidth = 960; // 프렛보드 너비
  const paddingLeft = 24; // 좌측 여백
  const extraPadding = 50; // 전체 패딩
  const frets = 12; // 총 프렛 수

  // 계산값
  const fretWidth = (fretboardWidth - paddingLeft) / frets; // 프렛의 너비

  // 원형의 중심 위치 계산
  const cx = (fret - 0.5) * fretWidth + paddingLeft + extraPadding;
  // cy는 prop으로 받은 calculatedY를 사용
  const cy = calculatedY;

  const onMarkerClick = () => {
    const nodeNote: ChromaticNote = {
      flatNumber: fret,
      lineNumber: lineNumber, // string 대신 lineNumber 사용
      chord: note,
      chromaticNumber: parseInt(note) || 0, // 임시값, 필요시 Flatboard에서 실제 chromaticNumber 전달
    };
    handleNodeClick && handleNodeClick(nodeNote);
  };

  return (
    <g
      onClick={onMarkerClick} // onClick 핸들러 함수 사용
      style={{ cursor: 'pointer' }}
    >
      {/* 원형 */}
      <circle
        cx={cx}
        cy={cy} // prop으로 받은 cy 사용
        r="10" // 이전 값 12에서 약간 줄임 (줄과 겹침 최소화 시도)
        fill={color ? color : 'rgba(0,0,0,0.1)'} // 기본 색상 변경 (Flatboard와 유사하게)
        stroke="#555" // stroke 색상 약간 어둡게
        strokeWidth="1"
      />
      {/* 텍스트 */}
      <text
        x={cx}
        y={cy} // cy를 기준으로, dominantBaseline으로 중앙 정렬
        fontSize="11" // 약간 키움
        textAnchor="middle"
        dominantBaseline="middle" // 수직 중앙 정렬
        fill="black"
        style={{ userSelect: 'none' }}
        fontWeight="bold" // 글자를 좀 더 잘보이게
      >
        {note}
      </text>
    </g>
  );
};

export default NoteMarker;
