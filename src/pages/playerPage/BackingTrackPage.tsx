import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import {
  Button,
  Slider,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Repeat,
  RepeatOne,
  CloudUpload,
  VolumeUp,
  Speed,
} from '@mui/icons-material';

const MediaPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isABRepeat, setIsABRepeat] = useState<boolean>(false);
  const [pointA, setPointA] = useState<number>(0);
  const [pointB, setPointB] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeat, setRepeat] = useState<string>('no-repeat');
  const [volume, setVolume] = useState<number>(1.0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
      setFileName(selectedFile.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isABRepeat) {
        audioRef.current.currentTime = pointA;
      }
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePlaybackRateChange = (e: Event, newValue: number | number[]) => {
    const rate = newValue as number;
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleRepeatToggle = (
    event: React.MouseEvent<HTMLElement>,
    newRepeat: string | null,
  ) => {
    if (newRepeat !== null) {
      setRepeat(newRepeat);
      if (audioRef.current) {
        if (newRepeat === 'repeat') {
          audioRef.current.loop = true;
        } else {
          audioRef.current.loop = false;
        }
      }
      if (newRepeat === 'ab-repeat') {
        setIsABRepeat(true);
      } else {
        setIsABRepeat(false);
        setPointA(0);
        setPointB(duration);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
    if (isABRepeat && audioRef.current && pointA !== null && pointB !== null) {
      if (audioRef.current.currentTime >= pointB) {
        audioRef.current.currentTime = pointA;
      }
    }
  };

  const handleSliderChange = (e: Event, newValue: number | number[]) => {
    if (isABRepeat) {
      const [newPointA, newPointB] = newValue as number[];
      setPointA(newPointA);
      setPointB(newPointB);
    } else {
      const newTime = newValue as number;
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [isABRepeat, pointA, pointB]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [file]);

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: 700,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}
          >
            🎸 Backing Track Player
          </Typography>

          {/* File Upload */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={handleUploadClick}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                padding: '10px 30px',
                fontSize: '1rem',
              }}
            >
              {fileName || '오디오 파일 업로드'}
            </Button>
          </Box>

          {file && <audio ref={audioRef} src={file} controls={false} />}

          {/* Playback Controls */}
          {file && (
            <Stack spacing={3} sx={{ mt: 3 }}>
              {/* Play/Pause Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Tooltip title="재생">
                  <IconButton
                    onClick={handlePlay}
                    disabled={isPlaying}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      width: 64,
                      height: 64,
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 40 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="일시정지">
                  <IconButton
                    onClick={handlePause}
                    disabled={!isPlaying}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      width: 64,
                      height: 64,
                    }}
                  >
                    <Pause sx={{ fontSize: 40 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Time Display */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
                {isABRepeat && (
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    A/B 구간: {formatTime(pointA)} - {formatTime(pointB)}
                  </Typography>
                )}
              </Box>

              {/* Progress Slider */}
              <Box sx={{ px: 2 }}>
                <Slider
                  min={0}
                  max={duration || 100}
                  value={isABRepeat ? [pointA, pointB] : currentTime}
                  onChange={handleSliderChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatTime}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                    },
                  }}
                />
              </Box>

              {/* Volume and Speed Controls */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <VolumeUp />
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={handleVolumeChange}
                      sx={{
                        color: 'white',
                      }}
                    />
                    <Typography sx={{ minWidth: 45 }}>
                      {Math.round(volume * 100)}%
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Speed />
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.05}
                      value={playbackRate}
                      onChange={handlePlaybackRateChange}
                      marks={[
                        { value: 0.5, label: '0.5x' },
                        { value: 1, label: '1x' },
                        { value: 2, label: '2x' },
                      ]}
                      sx={{
                        color: 'white',
                        '& .MuiSlider-markLabel': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                    <Typography sx={{ minWidth: 45 }}>
                      {playbackRate.toFixed(2)}x
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              {/* Repeat Mode Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                  value={repeat}
                  exclusive
                  onChange={handleRepeatToggle}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    '& .MuiToggleButton-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: 'none',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ToggleButton value="no-repeat">
                    <Tooltip title="반복 없음">
                      <Box>반복 없음</Box>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="repeat">
                    <Tooltip title="한 곡 반복">
                      <Repeat />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="ab-repeat">
                    <Tooltip title="A/B 구간 반복">
                      <RepeatOne />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MediaPlayer;
