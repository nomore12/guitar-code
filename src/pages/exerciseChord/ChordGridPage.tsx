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
} from '@mui/material';
import ChordDisplay from './ChordDisplay';
import { chordData } from './chordData';
import { generateRandomChordsWithCategories } from './randomChordGenerator';
import type { ChordCategories } from './randomChordGenerator';

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
