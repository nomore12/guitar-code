import React, { useState, useRef, useEffect } from "react";
import Chords from "../components/Chords";
import chordsData from "../data/chords";

const Main: React.FC = () => {
  return (
    <div>
      <Chords chord={chordsData.Am} />
    </div>
  );
};

export default Main;
