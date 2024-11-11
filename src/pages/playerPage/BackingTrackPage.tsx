import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import {
  Button,
  FormControlLabel,
  Slider,
  Typography,
  Box,
  TextField,
  Radio,
  RadioGroup,
} from '@mui/material';

const MediaPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isABRepeat, setIsABRepeat] = useState<boolean>(false);
  const [pointA, setPointA] = useState<number>(0);
  const [pointB, setPointB] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeat, setRepeat] = useState<string>('no-repeat');
  const [volume, setVolume] = useState<number>(1.0); // 볼륨 상태 추가

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
    }
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

  const handlePlaybackRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
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

  const handleRepeatRadio = (e: ChangeEvent<HTMLInputElement>) => {
    setRepeat(e.target.value);
    if (audioRef.current) {
      if (e.target.value === 'repeat') {
        audioRef.current.loop = true;
      } else {
        audioRef.current.loop = false;
      }
    }
    if (e.target.value === 'ab-repeat') {
      setIsABRepeat(true);
    } else {
      setIsABRepeat(false);
      setPointA(0);
      setPointB(duration);
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
      sx={{ padding: 4, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}
    >
      <Typography variant="h4" gutterBottom>
        Backing Track Player
      </Typography>
      <TextField
        type="file"
        inputProps={{ accept: 'audio/*,video/*' }}
        onChange={handleFileChange}
        variant="outlined"
        sx={{ marginBottom: 2 }}
      />
      {file && <audio ref={audioRef} src={file} controls={false} />}
      <Box sx={{ marginTop: 3 }}>
        <Button
          variant="contained"
          onClick={handlePlay}
          sx={{ marginRight: 1 }}
        >
          재생 시작
        </Button>
        <Button
          variant="contained"
          onClick={handlePause}
          sx={{ marginRight: 1 }}
        >
          멈추기
        </Button>
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Typography gutterBottom>재생 속도:</Typography>
        <TextField
          type="number"
          value={playbackRate}
          onChange={handlePlaybackRateChange}
          inputProps={{ step: 0.01, min: 0.5, max: 2 }}
          sx={{ width: 100, marginBottom: 2 }}
        />
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Typography gutterBottom>
          재생 위치:{' '}
          {isABRepeat
            ? `${pointA.toFixed(2)} - ${pointB.toFixed(2)}`
            : `${currentTime.toFixed(2)}초`}
        </Typography>
        <Slider
          min={0}
          max={duration}
          value={isABRepeat ? [pointA, pointB] : currentTime}
          onChange={(e: Event, value: number | number[]) =>
            handleSliderChange(e, value)
          }
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Typography gutterBottom>볼륨: {Math.round(volume * 100)}%</Typography>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e: Event, value: number | number[]) =>
            handleVolumeChange(e, value)
          }
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <RadioGroup
          row
          aria-labelledby="demo-radio-buttons-group-label"
          value={repeat}
          name="radio-buttons-group"
          onChange={handleRepeatRadio}
        >
          <FormControlLabel
            value="no-repeat"
            control={<Radio />}
            label="반복없음"
          />
          <FormControlLabel
            value="repeat"
            control={<Radio />}
            label="한 곡 반복"
          />
          <FormControlLabel
            value="ab-repeat"
            control={<Radio />}
            label="A/B 구간 반복"
          />
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default MediaPlayer;
