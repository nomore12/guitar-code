import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';

const useTonePlayer = (soundUrl: string, bpm: number = 60) => {
  const [player, setPlayer] = useState<Tone.Player | null>(null);
  const [beatLoop, setBeatLoop] = useState<Tone.Loop | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const beatCount = useRef(0);

  useEffect(() => {
    const createPlayer = async () => {
      const newPlayer = new Tone.Player();

      try {
        await newPlayer.load(soundUrl);
        setIsSoundLoaded(true);
        newPlayer.toDestination();

        setPlayer(newPlayer);
      } catch (e) {
        console.error('Unable to load sound file:', e);
      }
    };

    createPlayer();
  }, [soundUrl]);

  const handlePlay = (callback: () => void) => {
    const playerToUse = player as Tone.Player;

    if (playerToUse) {
      Tone.start().then(() => {
        beatCount.current = 0; // Reset beat count

        const transport = Tone.getTransport();
        transport.bpm.value = bpm; // set BPM
        transport.start(); // start Transport

        const loop = new Tone.Loop((time) => {
          playerToUse.start(time);
          beatCount.current++;
          if ((beatCount.current - 1) % 4 === 0) {
            callback();
          }
        }, '4n').start(0);

        setBeatLoop(loop);
      });
    }
  };

  const handleStop = () => {
    // Stop the Loop
    if (beatLoop) {
      beatLoop.stop();
    }

    // Stop the Transport and the Player
    Tone.getTransport().stop();
    player?.stop();
  };

  return { isSoundLoaded, handlePlay, handleStop };
};

export default useTonePlayer;
