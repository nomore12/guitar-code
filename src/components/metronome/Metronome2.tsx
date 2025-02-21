import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import {
  Box,
  Button,
  Slider,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const Metronome: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [loop, setLoop] = useState<Tone.Loop | null>(null);
  const [count, setCount] = useState(0);
  const [beatType, setBeatType] = useState(4); // 기본 4비트

  useEffect(() => {
    if (!isPlaying) {
      Tone.Transport.stop();
      loop?.stop();
      loop?.dispose();
      setLoop(null);
      return;
    }

    const startMetronome = async () => {
      await Tone.start(); // 오디오 컨텍스트 활성화

      // 박자 간격 조정 (4비트, 8비트, 16비트)
      const subdivision = 60 / bpm / (beatType / 4); // BPM에 맞게 박자 간격 계산

      // 강박 - 리얼한 킥 드럼 느낌
      const strongBeat = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 2,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 },
      }).toDestination();

      // 약박 - 부드러운 클릭음
      const highClick = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      }).toDestination();

      let beatCounter = 0;
      const metronomeLoop = new Tone.Loop((time) => {
        setCount(beatCounter % beatType); // 현재 박자 업데이트

        if (beatCounter % beatType === 0) {
          strongBeat.triggerAttackRelease('E3', '8n', time); // 강박음
        } else {
          highClick.triggerAttackRelease('16n', time); // 약박음
        }

        beatCounter++;
      }, subdivision); // subdivision(세분화된 박자) 적용

      metronomeLoop.start(0);
      Tone.Transport.start();
      setLoop(metronomeLoop);
    };

    startMetronome();

    return () => {
      Tone.Transport.stop();
      loop?.stop();
      loop?.dispose();
    };
  }, [isPlaying, bpm, beatType]);

  return (
    <Box
      sx={{
        width: 300,
        p: 3,
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6">Metronome</Typography>

      {/* BPM 조절 슬라이더 */}
      <Typography gutterBottom>BPM: {bpm}</Typography>
      <Slider
        value={bpm}
        onChange={(e, newValue) => setBpm(newValue as number)}
        min={40}
        max={240}
        step={1}
        aria-labelledby="bpm-slider"
      />

      {/* 비트 선택 드롭다운 */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Beat Type</InputLabel>
        <Select
          value={beatType}
          onChange={(e) => setBeatType(Number(e.target.value))}
        >
          <MenuItem value={4}>4비트</MenuItem>
          <MenuItem value={8}>8비트</MenuItem>
          <MenuItem value={16}>16비트</MenuItem>
        </Select>
      </FormControl>

      {/* 시작/스톱 버튼 */}
      <Button
        variant="contained"
        color={isPlaying ? 'error' : 'primary'}
        onClick={() => setIsPlaying((prev) => !prev)}
        sx={{ mt: 3 }}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </Button>

      {/* 현재 박자 표시 */}
      <Typography sx={{ mt: 2 }}>
        Count: {count + 1} / {beatType}
      </Typography>
    </Box>
  );
};

export default Metronome;
