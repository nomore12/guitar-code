import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import useNoteStore from '../../store/useNoteStore';

interface MetronomeProps {
  bpm: number;
}

const Metronome: React.FC<MetronomeProps> = ({ bpm: initialBpm }) => {
  const { isPracticePlaying, setIsPracticePlaying, incrementCurrentNoteIndex } =
    useNoteStore();

  const loopRef = useRef<Tone.Loop | null>(null);
  const strongBeatRef = useRef<Tone.MembraneSynth | null>(null);
  const highClickRef = useRef<Tone.NoiseSynth | null>(null);
  const beatCounterRef = useRef<number>(0);

  const [count, setCount] = useState(0);
  const [beatType, setBeatType] = useState(4);

  // BPM 변경 로직
  useEffect(() => {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.bpm.value = initialBpm;
      console.log(`Metronome: BPM updated to ${initialBpm}`);
    }
    // 이 useEffect는 initialBpm 변경 시에만 실행되어야 함
    // Transport가 시작되지 않은 상태에서 isPracticePlaying이 true가 될 때,
    // 아래 메인 useEffect에서 initialBpm을 사용하여 Transport를 시작함.
  }, [initialBpm]);

  // 메트로놈 시작/정지 및 Tone.js 객체 관리
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적

    const cleanupToneObjects = () => {
      console.log('Metronome: Cleaning up Tone objects...');
      if (loopRef.current) {
        loopRef.current.stop(0).dispose();
        loopRef.current = null;
        console.log('Metronome: Loop disposed.');
      }
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      console.log('Metronome: Transport stopped and cancelled.');

      if (strongBeatRef.current) {
        strongBeatRef.current.dispose();
        strongBeatRef.current = null;
        console.log('Metronome: Strong beat synth disposed.');
      }
      if (highClickRef.current) {
        highClickRef.current.dispose();
        highClickRef.current = null;
        console.log('Metronome: High click synth disposed.');
      }
      if (isMounted) setCount(0);
      beatCounterRef.current = 0;
    };

    if (!isPracticePlaying) {
      cleanupToneObjects();
      return;
    }

    console.log(
      `Metronome: Initializing for isPracticePlaying=${isPracticePlaying}, BPM=${initialBpm}, BeatType=${beatType}`,
    );

    const initializeAndStartTone = async () => {
      try {
        await Tone.start();
        console.log('Metronome: AudioContext started.');

        strongBeatRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.005,
          octaves: 3,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
        }).toDestination();
        highClickRef.current = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        }).toDestination();
        console.log('Metronome: Synths created.');

        beatCounterRef.current = 0;

        loopRef.current = new Tone.Loop((time) => {
          if (
            !isMounted ||
            !strongBeatRef.current ||
            !highClickRef.current ||
            Tone.Transport.state !== 'started'
          ) {
            // console.warn('Metronome: Loop callback skipped. Conditions not met.');
            return;
          }

          const currentBeatInMeasure = beatCounterRef.current % beatType;
          if (isMounted) setCount(currentBeatInMeasure);

          if (beatCounterRef.current > 0) {
            incrementCurrentNoteIndex();
          }

          try {
            if (currentBeatInMeasure === 0) {
              strongBeatRef.current.triggerAttackRelease('C4', '16n', time);
            } else {
              highClickRef.current.triggerAttackRelease('32n', time);
            }
          } catch (e) {
            console.error(
              'Metronome: Error in triggerAttackRelease inside loop:',
              e,
            );
          }
          beatCounterRef.current++;
        }, '4n');

        Tone.Transport.bpm.value = initialBpm; // Transport 시작 전 BPM 설정

        if (Tone.Transport.state !== 'started') {
          await Tone.Transport.start('+0.1');
          console.log('Metronome: Transport started.');
        } else {
          // 이미 시작된 경우, BPM은 위에서 이미 설정되었으므로 여기서는 로그만 남기거나 아무것도 안 함
          console.log(
            'Metronome: Transport already started. BPM re-applied if changed.',
          );
        }

        loopRef.current.start(0);
        console.log('Metronome: Loop started.');
      } catch (error) {
        console.error(
          'Metronome: Error during Tone.js initialization or start:',
          error,
        );
        if (isMounted) setIsPracticePlaying(false);
      }
    };

    initializeAndStartTone();

    return () => {
      isMounted = false;
      cleanupToneObjects();
      console.log('Metronome: useEffect cleanup finished.');
    };
    // initialBpm을 의존성에서 제거하고, beatType, 스토어 함수들에만 의존하도록 변경
  }, [
    isPracticePlaying,
    beatType,
    incrementCurrentNoteIndex,
    setIsPracticePlaying,
    initialBpm,
  ]);
  // initialBpm을 다시 추가합니다. isPracticePlaying이 true로 바뀔 때 현재의 initialBpm으로 시작해야 하기 때문입니다.

  const handleTogglePlay = useCallback(() => {
    setIsPracticePlaying(!isPracticePlaying);
  }, [isPracticePlaying, setIsPracticePlaying]);

  const handleBeatTypeChange = useCallback(
    (newBeatType: number) => {
      setBeatType(newBeatType);
      if (isPracticePlaying) {
        setIsPracticePlaying(false);
        setTimeout(() => {
          if (isMountedRef.current) {
            // beatType 변경 후 재시작 시점에도 마운트 확인
            setIsPracticePlaying(true);
          }
        }, 50);
      }
    },
    [isPracticePlaying, setIsPracticePlaying],
  );
  // handleBeatTypeChange 콜백 내 isMountedRef 사용을 위해 ref 생성 및 useEffect에서 값 설정 필요
  // 아래 isMountedRef 추가
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <Box
      sx={{
        width: 300,
        p: 2,
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: 2,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Metronome
      </Typography>
      <Typography gutterBottom sx={{ mb: 1 }}>
        BPM: {initialBpm}
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="beat-type-label">Beat Type</InputLabel>
        <Select
          labelId="beat-type-label"
          value={beatType}
          label="Beat Type"
          onChange={(e) => handleBeatTypeChange(Number(e.target.value))}
          size="small"
        >
          <MenuItem value={4}>4 Beats</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color={isPracticePlaying ? 'error' : 'primary'}
        onClick={handleTogglePlay}
        fullWidth
        sx={{ mb: 1 }}
      >
        {isPracticePlaying ? 'Stop' : 'Start'}
      </Button>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Count: {isPracticePlaying ? count + 1 : '-'} / {beatType}
      </Typography>
    </Box>
  );
};

export default Metronome;
