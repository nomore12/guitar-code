import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Button, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ChordData {
  chord: string;
  fingers: [number, number][];
  mute: number[];
  flat: number;
}

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const EditorWrapper = styled.div`
  display: flex;
  gap: 40px;
  align-items: start;
`;

const FretboardContainer = styled.div`
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background: white;
`;

const JsonOutput = styled.div`
  flex: 1;
  min-width: 400px;
`;

const JsonTextArea = styled.textarea`
  width: 100%;
  height: 400px;
  padding: 10px;
  font-family: monospace;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const ChordNameInput = styled(TextField)`
  margin-bottom: 20px;
`;

const FretboardSvg = styled.svg`
  cursor: pointer;
  user-select: none;
`;

const FretMarker = styled.circle`
  fill: #333;
  cursor: pointer;

  &:hover {
    fill: #666;
  }
`;

const EmptyFret = styled.rect`
  fill: transparent;
  cursor: pointer;

  &:hover {
    fill: rgba(0, 0, 0, 0.1);
  }
`;

const ChordEditor: React.FC = () => {
  const [chordName, setChordName] = useState('');
  const [fingers, setFingers] = useState<[number, number][]>([]);
  const [mute, setMute] = useState<number[]>([]);
  const [flat, setFlat] = useState(1);
  const [copied, setCopied] = useState(false);

  const fretCount = 5; // 표시할 프렛 수
  const stringCount = 6; // 줄 수
  const cellWidth = 60;
  const cellHeight = 40;
  const startX = 80;
  const startY = 40;

  // 프렛 클릭 핸들러
  const handleFretClick = (string: number, fret: number) => {
    const fingerIndex = fingers.findIndex(
      (f) => f[0] === string && f[1] === fret,
    );

    if (fingerIndex >= 0) {
      // 이미 있으면 제거
      setFingers(fingers.filter((_, i) => i !== fingerIndex));
    } else {
      // 같은 줄에 다른 운지가 있으면 제거하고 새로 추가
      const newFingers = fingers.filter((f) => f[0] !== string);
      setFingers([...newFingers, [string, fret]]);
    }
  };

  // 줄 뮤트 토글
  const toggleMute = (string: number) => {
    if (mute.includes(string)) {
      setMute(mute.filter((s) => s !== string));
    } else {
      setMute([...mute, string]);
    }
  };

  // 리셋
  const handleReset = () => {
    setChordName('');
    setFingers([]);
    setMute([]);
    setFlat(1);
  };

  // JSON 생성
  const generateJson = (): ChordData => {
    return {
      chord: chordName || 'NewChord',
      fingers: fingers.sort((a, b) => a[0] - b[0]),
      mute: mute.sort((a, b) => a - b),
      flat: flat,
    };
  };

  // JSON 문자열 생성
  const getJsonString = () => {
    const data = generateJson();
    const chordKey = data.chord;
    const formattedData = {
      [chordKey]: data,
    };
    return JSON.stringify(formattedData, null, 2).slice(1, -1).trim();
  };

  // 복사 기능
  const handleCopy = () => {
    navigator.clipboard.writeText(getJsonString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 프렛보드 그리기 (가로 방향)
  const renderFretboard = () => {
    const lines: React.ReactNode[] = [];
    const fretNumbers: React.ReactNode[] = [];
    const clickAreas: React.ReactNode[] = [];
    const stringNumbers: React.ReactNode[] = [];

    // 세로선 (프렛)
    for (let i = 0; i <= fretCount; i++) {
      lines.push(
        <line
          key={`v${i}`}
          x1={startX + i * cellWidth}
          y1={startY}
          x2={startX + i * cellWidth}
          y2={startY + (stringCount - 1) * cellHeight}
          stroke="black"
          strokeWidth={i === 0 ? 3 : 1}
        />,
      );
    }

    // 가로선 (줄)
    for (let i = 0; i < stringCount; i++) {
      lines.push(
        <line
          key={`h${i}`}
          x1={startX}
          y1={startY + i * cellHeight}
          x2={startX + fretCount * cellWidth}
          y2={startY + i * cellHeight}
          stroke="black"
          strokeWidth={1}
        />,
      );
    }

    // 프렛 번호 (상단)
    for (let i = 1; i <= fretCount; i++) {
      fretNumbers.push(
        <text
          key={`fret${i}`}
          x={startX + (i - 0.5) * cellWidth}
          y={startY - 10}
          fontSize="14"
          fill="#666"
          textAnchor="middle"
        >
          {i}
        </text>,
      );
    }

    // 줄 번호 (왼쪽) - 기타 표준: 위에서부터 1번줄(높은 E)
    for (let i = 1; i <= stringCount; i++) {
      stringNumbers.push(
        <text
          key={`string${i}`}
          x={startX - 25}
          y={startY + (i - 1) * cellHeight + 5}
          fontSize="14"
          fill="#333"
          textAnchor="middle"
        >
          {i}
        </text>,
      );
    }

    // 클릭 영역 및 운지 표시
    for (let string = 1; string <= stringCount; string++) {
      for (let fret = 1; fret <= fretCount; fret++) {
        const x = startX + (fret - 0.5) * cellWidth;
        const y = startY + (string - 1) * cellHeight;
        const isPressed = fingers.some((f) => f[0] === string && f[1] === fret);

        clickAreas.push(
          <g key={`click${string}-${fret}`}>
            <EmptyFret
              x={x - cellWidth / 2}
              y={y - cellHeight / 2}
              width={cellWidth}
              height={cellHeight}
              onClick={() => handleFretClick(string, fret)}
            />
            {isPressed && (
              <FretMarker
                cx={x}
                cy={y}
                r={12}
                onClick={() => handleFretClick(string, fret)}
              />
            )}
          </g>,
        );
      }
    }

    return { lines, fretNumbers, clickAreas, stringNumbers };
  };

  const { lines, fretNumbers, clickAreas, stringNumbers } = renderFretboard();

  return (
    <Container>
      <h1>코드 에디터</h1>

      <ChordNameInput
        label="코드 이름"
        variant="outlined"
        value={chordName}
        onChange={(e) => setChordName(e.target.value)}
        placeholder="예: Am, G7, Cmaj7"
        size="small"
        fullWidth
        style={{ maxWidth: 300 }}
      />

      <EditorWrapper>
        <FretboardContainer>
          <ControlButtons>
            <Button variant="contained" color="secondary" onClick={handleReset}>
              리셋
            </Button>
            <TextField
              label="시작 프렛"
              type="number"
              value={flat}
              onChange={(e) => setFlat(Number(e.target.value) || 1)}
              size="small"
              style={{ width: 100 }}
              inputProps={{ min: 1, max: 12 }}
            />
          </ControlButtons>

          <FretboardSvg
            width={startX + fretCount * cellWidth + 60}
            height={startY + (stringCount - 1) * cellHeight + 40}
          >
            {lines}
            {fretNumbers}
            {stringNumbers}
            {clickAreas}

            {/* 뮤트 표시 (왼쪽) */}
            {[1, 2, 3, 4, 5, 6].map((string) => (
              <g key={`mute${string}`}>
                <circle
                  cx={startX - 35}
                  cy={startY + (string - 1) * cellHeight}
                  r={13}
                  fill={mute.includes(string) ? '#ff4444' : 'white'}
                  stroke={mute.includes(string) ? '#ff4444' : '#ddd'}
                  strokeWidth={2}
                  cursor="pointer"
                  onClick={() => toggleMute(string)}
                />
                <text
                  x={startX - 35}
                  y={startY + (string - 1) * cellHeight + 5}
                  fontSize="16"
                  fill={mute.includes(string) ? 'white' : '#666'}
                  textAnchor="middle"
                  cursor="pointer"
                  style={{ userSelect: 'none' }}
                  onClick={() => toggleMute(string)}
                >
                  ×
                </text>
              </g>
            ))}
          </FretboardSvg>

          <Box mt={2}>
            <strong>사용법:</strong>
            <ul>
              <li>프렛을 클릭하여 운지 추가/제거</li>
              <li>왼쪽 × 버튼을 클릭하여 줄 뮤트</li>
              <li>시작 프렛을 변경하여 바레 코드 위치 조정</li>
            </ul>
          </Box>
        </FretboardContainer>

        <JsonOutput>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <h3>JSON 출력</h3>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? '복사됨!' : '복사'}
            </Button>
          </Box>

          <JsonTextArea
            value={getJsonString()}
            readOnly
            onClick={(e) => e.currentTarget.select()}
          />

          <Box mt={2}>
            <strong>현재 설정:</strong>
            <ul>
              <li>운지: {fingers.length}개</li>
              <li>
                뮤트: {mute.length > 0 ? mute.join(', ') + '번 줄' : '없음'}
              </li>
              <li>시작 프렛: {flat}</li>
            </ul>
          </Box>
        </JsonOutput>
      </EditorWrapper>
    </Container>
  );
};

export default ChordEditor;
