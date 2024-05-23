import React, { useState, useRef, useEffect } from "react";
import Chords from "../components/Chords";
import chordsData from "../data/chords.json";
import * as Tone from "tone";

const allChords = [
  chordsData.A,
  chordsData.Am,
  chordsData.C,
  chordsData.D,
  chordsData.Dm,
  chordsData.E,
  chordsData.Em,
  chordsData.F,
  chordsData.G,
];

function getRandomElement(arr: any[]) {
  var index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

const Main: React.FC = () => {
  const [currentChord, setCurrentChord] = useState<{
    chord: string;
    fingers: number[][];
    mute: number[];
  }>(chordsData.F);
  const [player, setPlayer] = useState<Tone.Player | null>(null);
  const [beatLoop, setBeatLoop] = useState<Tone.Loop | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  const beatCount = useRef(0);

  const handlePlay = async () => {
    const playerToUse = player as Tone.Player;

    if (playerToUse) {
      await Tone.start();
      beatCount.current = 0; // Reset beat count

      const transport = Tone.getTransport();
      transport.bpm.value = 80; // set BPM to 80
      transport.start(); // start Transport

      const loop = new Tone.Loop((time) => {
        playerToUse.start(time);
        beatCount.current++;
        if ((beatCount.current - 1) % 4 === 1) {
          console.log("show next chord", beatCount.current);
          setCurrentChord(getRandomElement(allChords));
        }
      }, "4n").start(0);

      setBeatLoop(loop);
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

  useEffect(() => {
    const createPlayer = async () => {
      const url = "sounds/Kick.wav";
      const newPlayer = new Tone.Player();

      try {
        await newPlayer.load(url);
        setIsSoundLoaded(true);
        newPlayer.toDestination();

        setPlayer(newPlayer);
      } catch (e) {
        console.error("Unable to load sound file:", e);
      }
    };

    createPlayer();
  }, []);

  return (
    <div>
      <div>
        <Chords chord={currentChord} />
      </div>
      <div>
        <button onClick={() => setCurrentChord(chordsData.A)}>A</button>
        <button onClick={() => setCurrentChord(chordsData.Am)}>Am</button>
        <button onClick={() => setCurrentChord(chordsData.C)}>C</button>
        <button onClick={() => setCurrentChord(chordsData.D)}>D</button>
        <button onClick={() => setCurrentChord(chordsData.Dm)}>Dm</button>
        <button onClick={() => setCurrentChord(chordsData.E)}>E</button>
        <button onClick={() => setCurrentChord(chordsData.Em)}>Em</button>
        <button onClick={() => setCurrentChord(chordsData.F)}>F</button>
        <button onClick={() => setCurrentChord(chordsData.G)}>G</button>
      </div>
      {isSoundLoaded && (
        <>
          <button onClick={handlePlay}>kick</button>
          <button onClick={handleStop}>stop</button>
        </>
      )}
    </div>
  );
};

export default Main;
