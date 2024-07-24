import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

interface TonePlayerProps {
  bpm: number;
  volume: number;
  beat: '4' | '8' | '16';
  callback: () => void;
}

const useTonePlayer = ({ bpm, volume, beat, callback }: TonePlayerProps) => {
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const kick = new Tone.MembraneSynth({ volume }).toDestination();
    const snare = new Tone.MembraneSynth({ volume }).toDestination();
    const hihat = new Tone.MembraneSynth({ volume }).toDestination();
    const tom = new Tone.MembraneSynth({ volume }).toDestination();
    const last = new Tone.MembraneSynth({ volume }).toDestination();

    const patterns: { [key: string]: (string | null)[] } = {
      '4': ['kick', 'hihat', 'snare', 'last'],
      '8': [
        'kick',
        'hihat',
        'snare',
        'hihat',
        'kick',
        'hihat',
        'snare',
        'last',
      ],
      '16': [
        'kick',
        'hihat',
        null,
        'hihat',
        'snare',
        'hihat',
        null,
        'hihat',
        'kick',
        'hihat',
        null,
        'hihat',
        'snare',
        'hihat',
        'tom',
        'last',
      ],
    };

    const halfBeatTimes: { [key: string]: number } = {
      '4': (60 / bpm) * 1000 * 2,
      '8': (60 / bpm) * 1000 * 1,
      '16': (60 / bpm) * 1000 * 0.5,
    };

    const notes = patterns[beat];
    let index = 0;

    const loop = new Tone.Loop((time) => {
      const note = notes[index % notes.length];
      switch (note) {
        case 'kick': {
          kick.triggerAttackRelease('C1', '8n', time);
          break;
        }
        case 'snare': {
          snare.triggerAttackRelease('E1', '8n', time);
          break;
        }
        case 'hihat': {
          hihat.triggerAttackRelease('G1', '16n', time);
          break;
        }
        case 'tom': {
          tom.triggerAttackRelease('A1', '8n', time);
          break;
        }
        case 'last': {
          last.triggerAttackRelease('A1', '8n', time);
          const delay = halfBeatTimes[beat] * 0.1;
          setTimeout(callback, delay);
          break;
        }
        default:
          break;
      }
      index++;
    }, `${notes.length}n`);

    if (isPlaying) {
      const transport = Tone.getTransport();
      transport.bpm.value = bpm;
      transport.start();
      loop.start(0);
    } else {
      loop.stop();
      Tone.getTransport().stop();
    }

    setIsSoundLoaded(true);

    return () => {
      loop.dispose();
    };
  }, [isPlaying, bpm, volume, beat, callback]);

  const handlePlay = () => {
    Tone.start().then(() => {
      setIsPlaying(true);
    });
  };

  const handleStop = () => {
    const transport = Tone.getTransport();
    transport.stop();
    setIsPlaying(false);
  };

  return { isSoundLoaded, handlePlay, handleStop };
};

export default useTonePlayer;
