import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  useTheme,
  useMediaQuery,
  Slider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import ChordDisplay from './ChordDisplay';
import { chordData } from './chordData';
import { generateRandomChordsWithCategories } from './randomChordGenerator';
import type { ChordCategories } from './randomChordGenerator';
import useTonePlayer from '../../hooks/useTonePlayer';

const ChordGridPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [hideFingers, setHideFingers] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [displayChords, setDisplayChords] = useState(chordData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ChordCategories>(
    {
      openPosition: true,
      barreChords: true,
      diminishedChords: false,
      minor7b5Chords: false,
      augmentedChords: false,
      sus4Chords: false,
      sixthChords: false,
      seventhChords: false,
    },
  );

  // 메트로놈 상태
  const [bpm, setBpm] = useState<number>(60);
  const [volume, setVolume] = useState(10);
  const [beat, setBeat] = useState<'4' | '8' | '16'>('4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentMeasure, setCurrentMeasure] = useState<number>(0);

  // 컴포넌트 마운트 시 랜덤하게 하나의 코드에 포커스
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 16);
    setFocusedIndex(randomIndex);
  }, []);

  // 코드 클릭 시 포커스 변경
  const handleChordClick = (index: number) => {
    setFocusedIndex(index);
  };

  const toggleHideFingers = () => {
    setHideFingers(!hideFingers);
  };

  // 메트로놈 콜백 - 마디가 끝날 때마다 호출되어 코드 포커스 변경
  function metronomeCallback() {
    setCurrentMeasure((prevMeasure) => {
      const nextMeasure = prevMeasure + 1;

      // 16마디 완료 시 자동 정지
      if (nextMeasure >= 16) {
        handleStop();
        setIsPlaying(false);
        setCurrentMeasure(0);
        return 0;
      }

      // 다음 코드로 포커스 이동
      setFocusedIndex(nextMeasure);
      return nextMeasure;
    });
  }

  const { handlePlay, handleStop } = useTonePlayer({
    bpm,
    volume,
    beat,
    callback: metronomeCallback,
  });

  // 시작 버튼 핸들러 (카운트다운 포함)
  const handleStartMetronome = () => {
    if (countdown !== null) return;

    // 첫 번째 코드로 포커스 설정
    setCurrentMeasure(0);
    setFocusedIndex(0);

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handlePlay();
          setIsPlaying(true);
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
    setCurrentMeasure(0);
  };

  // BPM 변경 핸들러
  const onChangeBpm = (_event: Event, value: number | number[]) => {
    const bpmValue = Array.isArray(value) ? value[0] : value;
    if (bpmValue < 40 || bpmValue >= 300) {
      return;
    }
    setBpm(bpmValue);
  };

  // 체크박스 변경 핸들러
  const handleCategoryChange = (category: keyof ChordCategories) => {
    // 현재 선택된 카테고리 개수 확인
    const currentSelectedCount =
      Object.values(selectedCategories).filter(Boolean).length;

    // 마지막 하나를 비활성화하려고 하는 경우 방지
    if (currentSelectedCount === 1 && selectedCategories[category]) {
      alert('최소 1개 이상의 코드 카테고리를 선택해야 합니다.');
      return;
    }

    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 랜덤 코드 생성
  const generateNewChords = async () => {
    setIsGenerating(true);

    try {
      // 로딩 시뮬레이션 (실제로는 생성이 빠름)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newChords = generateRandomChordsWithCategories(selectedCategories);
      setDisplayChords(newChords);

      // 새로운 랜덤 포커스 설정
      const randomIndex = Math.floor(Math.random() * 16);
      setFocusedIndex(randomIndex);
    } catch (error) {
      console.error('코드 생성 실패:', error);
      // 실패 시 기본 코드로 복원
      setDisplayChords(chordData);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* 메트로놈 컨트롤 */}
      <Box
        sx={{
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          bgcolor: '#f9f9f9',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
          메트로놈
          {isPlaying && (
            <Typography component="span" variant="h6" color="primary" ml={2}>
              {currentMeasure + 1}/16 마디
            </Typography>
          )}
        </Typography>

        {/* 카운트다운 표시 */}
        {countdown !== null && (
          <Box textAlign="center" mb={2}>
            <Typography variant="h1" component="div" fontWeight="bold">
              {countdown}
            </Typography>
          </Box>
        )}

        {/* 컨트롤 버튼 */}
        <Box mb={3} textAlign="center">
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartMetronome}
              disabled={isPlaying || countdown !== null}
            >
              시작
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStopMetronome}
              disabled={!isPlaying && countdown === null}
            >
              정지
            </Button>
          </Stack>
        </Box>

        {/* 메트로놈 설정 */}
        <Grid container spacing={3}>
          {/* BPM 설정 */}
          <Grid item xs={12} sm={4}>
            <Typography gutterBottom>BPM: {bpm}</Typography>
            <Slider
              value={bpm}
              onChange={onChangeBpm}
              min={40}
              max={300}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* 볼륨 설정 */}
          <Grid item xs={12} sm={4}>
            <Typography gutterBottom>볼륨: {volume}</Typography>
            <Slider
              value={volume}
              onChange={(_event, value) =>
                setVolume(Array.isArray(value) ? value[0] : value)
              }
              min={0}
              max={30}
              valueLabelDisplay="auto"
            />
          </Grid>

          {/* 비트 설정 */}
          <Grid item xs={12} sm={4}>
            <FormControl>
              <FormLabel component="legend">비트</FormLabel>
              <RadioGroup
                row
                value={beat}
                onChange={(e) => setBeat(e.target.value as '4' | '8' | '16')}
              >
                <FormControlLabel
                  value="4"
                  control={<Radio />}
                  label="4 beat"
                />
                <FormControlLabel
                  value="8"
                  control={<Radio />}
                  label="8 beat"
                />
                <FormControlLabel
                  value="16"
                  control={<Radio />}
                  label="16 beat"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          기타 코드 연습
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: isMobile ? 'stretch' : 'flex-end',
          }}
        >
          <Grid
            container
            spacing={1}
            sx={{
              maxWidth: 600,
              justifyContent: isMobile ? 'center' : 'flex-end',
            }}
          >
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.openPosition}
                    onChange={() => handleCategoryChange('openPosition')}
                    size="small"
                  />
                }
                label="오픈포지션"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.barreChords}
                    onChange={() => handleCategoryChange('barreChords')}
                    size="small"
                  />
                }
                label="하이코드(5,6번줄)"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.diminishedChords}
                    onChange={() => handleCategoryChange('diminishedChords')}
                    size="small"
                  />
                }
                label="Diminished"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.minor7b5Chords}
                    onChange={() => handleCategoryChange('minor7b5Chords')}
                    size="small"
                  />
                }
                label="Minor7b5"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.augmentedChords}
                    onChange={() => handleCategoryChange('augmentedChords')}
                    size="small"
                  />
                }
                label="Augmented"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.sus4Chords}
                    onChange={() => handleCategoryChange('sus4Chords')}
                    size="small"
                  />
                }
                label="Sus4"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
            <Grid item xs={isSmall ? 12 : 6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.seventhChords}
                    onChange={() => handleCategoryChange('seventhChords')}
                    size="small"
                  />
                }
                label="7th 코드"
                sx={{
                  fontSize: '0.8rem',
                  '& .MuiFormControlLabel-label': { fontSize: '0.8rem' },
                }}
              />
            </Grid>
          </Grid>
          <Stack
            direction="row"
            spacing={1}
            justifyContent={isMobile ? 'center' : 'flex-end'}
          >
            <Button
              variant="contained"
              color="success"
              onClick={generateNewChords}
              disabled={isGenerating}
              sx={{ fontSize: '0.9rem' }}
            >
              {isGenerating ? '생성 중...' : '코드 생성'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={toggleHideFingers}
              sx={{ fontSize: '0.9rem' }}
            >
              {hideFingers ? '운지법 보이기' : '운지법 숨기기'}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {displayChords.map((chord, index) => (
          <Grid item xs={6} sm={6} md={3} lg={3} key={index}>
            <Box
              onClick={() => handleChordClick(index)}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ChordDisplay
                chord={chord}
                focused={focusedIndex === index}
                hide={hideFingers}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ChordGridPage;
