import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface TonePlayerProps {
  bpm: number;
  volume: number;
  callback: () => void;
}

const useTonePlayer = ({ bpm = 60, volume = 0, callback }: TonePlayerProps) => {
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const beatCount = useRef(0);

  useEffect(() => {
    const kick = new Tone.MembraneSynth({ volume }).toDestination();
    const snare = new Tone.MembraneSynth({ volume }).toDestination();
    const hihat = new Tone.MembraneSynth({ volume }).toDestination();
    const tom = new Tone.MembraneSynth({ volume }).toDestination();

    const pattern = new Tone.Pattern(
      (time, note) => {
        if (note === 'kick') {
          kick.triggerAttackRelease('C1', '8n', time);
        } else if (note === 'snare') {
          snare.triggerAttackRelease('E1', '8n', time);
        } else if (note === 'hihat') {
          hihat.triggerAttackRelease('G1', '16n', time);
        } else if (note === 'tom') {
          tom.triggerAttackRelease('A1', '8n', time);
          const delay = (60 / bpm) * 1000 * 0.75; // 3/4 of a beat delay
          setTimeout(callback, delay);
        }
      },
      ['kick', 'hihat', 'snare', 'tom'],
    );

    if (isPlaying) {
      Tone.getTransport().start();
      pattern.start(0);
    } else {
      pattern.stop();
      Tone.getTransport().stop();
    }

    setIsSoundLoaded(true);

    return () => {
      pattern.dispose();
    };
  }, [isPlaying, bpm, volume, callback]);

  const handlePlay = () => {
    Tone.start().then(() => {
      beatCount.current = 0;

      const transport = Tone.getTransport();
      transport.bpm.value = bpm;
      transport.start();

      setIsPlaying(true);
    });
  };

  const handleStop = () => {
    Tone.getTransport().stop();

    setIsPlaying(false);
  };

  return { isSoundLoaded, handlePlay, handleStop };
};

export default useTonePlayer;
