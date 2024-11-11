import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Slider,
  Typography,
  Box,
  TextField,
} from '@mui/material';

const MediaPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isABRepeat, setIsABRepeat] = useState<boolean>(false);
  const [pointA, setPointA] = useState<number | null>(null);
  const [pointB, setPointB] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isABRepeat && pointA !== null) {
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

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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

  const handleRepeatToggle = () => {
    setIsRepeating(!isRepeating);
    if (audioRef.current) {
      audioRef.current.loop = !isRepeating;
    }
  };

  const handleSetPointA = (e: Event, value: number | number[]) => {
    const newTime = value as number;
    setPointA(newTime);
  };

  const handleSetPointB = (e: Event, value: number | number[]) => {
    const newTime = value as number;
    setPointB(newTime);
  };

  const handleABRepeatToggle = () => {
    setIsABRepeat(!isABRepeat);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
    if (isABRepeat && pointA !== null && pointB !== null) {
      if (audioRef.current && audioRef.current.currentTime >= pointB) {
        audioRef.current.currentTime = pointA;
      }
    }
  };

  const handleSeekChange = (e: Event, value: number | number[]) => {
    const newTime = value as number;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeekMouseUp = () => {
    if (audioRef.current) {
      if (isPlaying) {
        if (isABRepeat && pointA !== null) {
          audioRef.current.currentTime = pointA;
        }
        audioRef.current.play();
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
        <Button variant="contained" onClick={handleStop}>
          재생 종료
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
          재생 위치: {currentTime.toFixed(2)}초
        </Typography>
        <Slider
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e: Event, value: number | number[]) =>
            handleSeekChange(e as Event, value)
          }
          onMouseUp={handleSeekMouseUp}
        />
        {/*<TextField*/}
        {/*    type="number"*/}
        {/*    value={currentTime}*/}
        {/*    onChange={(e) => handleSeekChange(e as unknown as Event, parseFloat(e.target.value))}*/}
        {/*    inputProps={{ step: 0.1, min: 0, max: duration }}*/}
        {/*    sx={{ width: 100, marginTop: 2 }}*/}
        {/*/>*/}
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <FormControlLabel
          control={
            <Checkbox checked={isRepeating} onChange={handleRepeatToggle} />
          }
          label="반복하기"
        />
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Typography gutterBottom>구간 시작점 (A):</Typography>
        <Slider
          min={0}
          max={duration}
          value={pointA ?? 0}
          onChange={(e: Event, value: number | number[]) =>
            handleSetPointA(e as Event, value)
          }
        />
        <TextField
          type="number"
          value={pointA ?? 0}
          onChange={(e: any) =>
            handleSetPointA(e as unknown as Event, parseFloat(e.target.value))
          }
          inputProps={{ step: 0.1, min: 0, max: duration }}
          sx={{ width: 100, marginTop: 2 }}
        />
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Typography gutterBottom>구간 종료점 (B):</Typography>
        <Slider
          min={0}
          max={duration}
          value={pointB ?? 0}
          onChange={(e: Event, value: number | number[]) =>
            handleSetPointB(e as Event, value)
          }
        />
        <TextField
          type="number"
          value={pointB ?? 0}
          onChange={(e: any) =>
            handleSetPointB(e as unknown as Event, parseFloat(e.target.value))
          }
          inputProps={{ step: 0.1, min: 0, max: duration }}
          sx={{ width: 100, marginTop: 2 }}
        />
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <FormControlLabel
          control={
            <Checkbox checked={isABRepeat} onChange={handleABRepeatToggle} />
          }
          label="A/B 반복하기"
        />
      </Box>
      {pointA !== null && pointB !== null && (
        <Typography sx={{ marginTop: 2 }}>
          A: {pointA.toFixed(2)}초, B: {pointB.toFixed(2)}초
        </Typography>
      )}
    </Box>
  );
};

export default MediaPlayer;
