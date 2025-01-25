import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import Soundfont from 'soundfont-player';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import useNoteStore from '../../store/PracticeStore';

const BEAT_PATTERNS: Record<number, string[][]> = {
  4: [
    ['kick'], // 첫 박자: kick + hihat
    ['hihat'], // 둘째 박자: hihat
    ['snare'], // 셋째 박자: snare + hihat
    ['hihat'], // 넷째 박자: hihat
  ],
  8: [
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat'],
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat'],
  ],
  16: [
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat'],
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat'],
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat'],
    ['kick'],
    ['hihat'],
    ['snare'],
    ['hihat'],
  ],
};
function Metronome() {
  const [bpm, setBpm] = useState(100);
  const [subdivision, setSubdivision] = useState(4); // 기본값 변경
  const [beatNumber, setBeatNumber] = useState(0); // 현재 박자
  const audioContextRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<Soundfont.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerIDRef = useRef<number | null>(null);
  const lookahead = 25.0;
  const scheduleAheadTime = 0.1;
  const nextNoteTimeRef = useRef(0);
  const currentBeatIndexRef = useRef(0);
  const { isPracticePlaying, setIsPracticePlaying, incrementIndex } =
    useNoteStore();

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    Soundfont.instrument(audioContextRef.current, 'synth_drum') // 변경된 MIDI 음색
      .then((player) => {
        playerRef.current = player;
      })
      .catch((err) => {
        console.error('Failed to load instrument', err);
      });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  function nextNote() {
    const secondsPerBeat = 60.0 / bpm; // 한 박자의 길이 (초)
    const interval =
      secondsPerBeat / (subdivision === 4 ? 1 : subdivision === 8 ? 2 : 4); // subdivision에 따른 박자 간격

    nextNoteTimeRef.current += interval;
    currentBeatIndexRef.current += 1;

    // BeatNumber를 계속 증가
    setBeatNumber((prevBeat) => prevBeat + 1);
  }

  function scheduleNote(beatIndex: number, time: number) {
    const MIDI_NOTES = {
      kick: '36',
      snare: '38',
      hihat: '42',
    };

    if (playerRef.current && audioContextRef.current) {
      const pattern = BEAT_PATTERNS[subdivision];
      if (!pattern) return;

      // 현재 박자의 음 하나만 선택 (여러 음 중 첫 번째 음)
      const currentBeat = pattern[beatIndex % pattern.length];
      const instrument = currentBeat[0]; // 첫 번째 음만 재생

      if (instrument) {
        playerRef.current!.play(
          MIDI_NOTES[instrument as keyof typeof MIDI_NOTES],
          time,
          { duration: 0.2 },
        );
      }
    }
  }

  function scheduler() {
    if (!audioContextRef.current) return;
    while (
      nextNoteTimeRef.current <
      audioContextRef.current.currentTime + scheduleAheadTime
    ) {
      scheduleNote(currentBeatIndexRef.current, nextNoteTimeRef.current);
      nextNote();
    }
  }

  useEffect(() => {
    if (isPlaying) {
      nextNoteTimeRef.current = audioContextRef.current!.currentTime;
      currentBeatIndexRef.current = 0;
      // beatNumber를 초기화하지 않음
      timerIDRef.current = window.setInterval(scheduler, lookahead);
    } else {
      if (timerIDRef.current !== null) {
        clearInterval(timerIDRef.current);
        timerIDRef.current = null;
      }
      setBeatNumber(0); // Stop 버튼을 눌렀을 때만 초기화
    }

    return () => {
      if (timerIDRef.current !== null) {
        clearInterval(timerIDRef.current);
        timerIDRef.current = null;
      }
    };
  }, [isPlaying, bpm, subdivision]);

  useEffect(() => {
    console.log(beatNumber);
    incrementIndex();
  }, [beatNumber]);

  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Metronome
      </Typography>
      {/* <Typography variant="h6">Current Beat: {beatNumber + 1}</Typography> */}
      <Stack spacing={3} direction="row" alignItems="center">
        <FormControl>
          <Stack spacing={2} direction="row" alignItems="center">
            <Typography sx={{ minWidth: '100px' }} noWrap>
              BPM: ({bpm})
            </Typography>
            <Slider
              value={bpm}
              onChange={(_, value) => setBpm(value as number)}
              min={40}
              max={300}
              valueLabelDisplay="auto"
              aria-label="BPM"
              sx={{ width: '400px' }}
            />
          </Stack>
        </FormControl>
        <FormControl sx={{ width: '150px' }}>
          <InputLabel>Beat</InputLabel>
          <Select
            value={subdivision}
            label="Beat"
            size="small"
            onChange={(e) => setSubdivision(Number(e.target.value))}
          >
            <MenuItem value={4}>4 Beat</MenuItem>
            <MenuItem value={8}>8 Beat</MenuItem>
            <MenuItem value={16}>16 Beat</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            setIsPlaying((prev) => !prev);
            setIsPracticePlaying(!isPracticePlaying);
            setBeatNumber(0);
          }}
          startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
          sx={{ width: '120px' }}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </Button>
      </Stack>
    </Box>
  );
}

export default Metronome;
