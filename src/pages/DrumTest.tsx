import React, { useEffect, useState } from 'react';
import * as Tone from 'tone';

const DrumMachine: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create drum sounds
    const kick = new Tone.MembraneSynth().toDestination();
    const snare = new Tone.MembraneSynth().toDestination();
    const hihat = new Tone.MembraneSynth().toDestination();

    // Define the 4-beat pattern
    const pattern = new Tone.Pattern(
      (time, note) => {
        if (note === 'kick') {
          kick.triggerAttackRelease('C1', '8n', time);
        } else if (note === 'snare') {
          snare.triggerAttackRelease('E1', '8n', time);
        } else if (note === 'hihat') {
          hihat.triggerAttackRelease('G1', '16n', time);
        }
      },
      ['kick', 'hihat', 'snare', 'hihat'],
    );

    if (isPlaying) {
      Tone.Transport.start();
      pattern.start(0);
    } else {
      pattern.stop();
      Tone.Transport.stop();
    }

    return () => {
      pattern.dispose();
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Start'}</button>
    </div>
  );
};

export default DrumMachine;
