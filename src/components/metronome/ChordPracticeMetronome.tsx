import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Slider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
} from '@mui/material';
import useTonePlayer from '../../hooks/useTonePlayer';

export interface ChordPracticeMetronomeProps {
  /** 메트로놈이 플레이 중일 때 호출되는 콜백 (마디가 끝날 때마다) */
  onMeasureComplete?: () => void;
  /** 메트로놈 상태 변경 시 호출되는 콜백 */
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** 현재 마디 번호 (1-16) */
  currentMeasure?: number;
  /** 전체 마디 수 (기본값: 16) */
  totalMeasures?: number;
}

const ChordPracticeMetronome: React.FC<ChordPracticeMetronomeProps> = ({
  onMeasureComplete,
  onPlayStateChange,
  currentMeasure = 0,
  totalMeasures = 16,
}) => {
  const [bpm, setBpm] = useState<number>(60);
  const [volume, setVolume] = useState(10);
  const [beat, setBeat] = useState<'4' | '8' | '16'>('4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 메트로놈 콜백 - 마디가 끝날 때마다 호출
  const metronomeCallback = () => {
    onMeasureComplete?.();
  };

  const { handlePlay, handleStop } = useTonePlayer({
    bpm,
    volume,
    beat,
    callback: metronomeCallback,
  });

  // 시작 버튼 핸들러 (카운트다운 포함)
  const handleStartMetronome = () => {
    if (countdown !== null) return;

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handlePlay();
          setIsPlaying(true);
          onPlayStateChange?.(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 정지 버튼 핸들러
  const handleStopMetronome = () => {
    handleStop();
    setIsPlaying(false);
    setCountdown(null);
    onPlayStateChange?.(false);
  };

  // BPM 변경 핸들러
  const onChangeBpm = (_event: Event, value: number | number[]) => {
    const bpmValue = Array.isArray(value) ? value[0] : value;
    if (bpmValue < 40 || bpmValue >= 300) {
      return;
    }
    setBpm(bpmValue);
  };

  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid #ccc',
        borderRadius: 2,
        bgcolor: '#f9f9f9',
        mb: 2,
        width: 360,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {countdown === null ? (
          <Typography variant="body1" component="h2" fontWeight="bold" mb={1}>
            메트로놈
            {isPlaying && (
              <Typography
                component="span"
                variant="caption"
                color="primary"
                ml={1.5}
              >
                {currentMeasure + 1}/{totalMeasures} 마디
              </Typography>
            )}
          </Typography>
        ) : (
          <Box textAlign="center" mb={1}>
            <Typography variant="h5" component="div" fontWeight="bold">
              {countdown}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 컨트롤 버튼 */}
      <Box mb={1.5} textAlign="center">
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartMetronome}
            disabled={isPlaying || countdown !== null}
            size="small"
            sx={{ fontSize: '0.8rem', py: 0.5 }}
          >
            시작
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleStopMetronome}
            disabled={!isPlaying && countdown === null}
            size="small"
            sx={{ fontSize: '0.8rem', py: 0.5 }}
          >
            정지
          </Button>
        </Stack>
      </Box>

      {/* 메트로놈 설정 */}
      <Stack spacing={1}>
        {/* BPM 설정 */}
        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
            BPM: {bpm}
          </Typography>
          <Slider
            value={bpm}
            onChange={onChangeBpm}
            min={40}
            max={300}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        {/* 볼륨 설정 */}
        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
            볼륨: {volume}
          </Typography>
          <Slider
            value={volume}
            onChange={(_event, value) =>
              setVolume(Array.isArray(value) ? value[0] : value)
            }
            min={0}
            max={30}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>

        {/* 비트 설정 */}
        <Box sx={{ width: '100%' }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              component="legend"
              sx={{ fontSize: '0.75rem', mb: 0.25 }}
            >
              비트
            </FormLabel>
            <RadioGroup
              row
              value={beat}
              onChange={(e) => setBeat(e.target.value as '4' | '8' | '16')}
              sx={{ width: '100%', justifyContent: 'center' }}
            >
              <FormControlLabel
                value="4"
                control={<Radio size="small" />}
                label="4 beat"
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: '0.7rem' },
                  flex: 1,
                }}
              />
              <FormControlLabel
                value="8"
                control={<Radio size="small" />}
                label="8 beat"
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: '0.7rem' },
                  flex: 1,
                }}
              />
              <FormControlLabel
                value="16"
                control={<Radio size="small" />}
                label="16 beat"
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: '0.7rem' },
                  flex: 1,
                }}
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChordPracticeMetronome;
