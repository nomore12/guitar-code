import React, { useState, useRef, useEffect } from "react";
import Chords from "../components/Chords";
import chordsData from "../data/chords.json";

const Main: React.FC = () => {
  const [currentChord, setCurrentChord] = useState<{
    chord: string;
    fingers: number[][];
    mute: number[];
  }>(chordsData.F);

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
    </div>
  );
};

export default Main;
