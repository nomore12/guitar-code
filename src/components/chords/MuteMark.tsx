import React from "react";
import { lineToNumber } from "../../utils/chordsUtils";

interface PropsType {
  line: number;
}

const MuteMark: React.FC<PropsType> = ({ line }) => {
  return (
    <>
      <line
        x1={lineToNumber(line) * 20 - 8}
        y1={10}
        x2={lineToNumber(line) * 20 + 8}
        y2={24}
        strokeWidth={2}
        stroke="black"
      />
      <line
        x1={lineToNumber(line) * 20 + 8}
        y1={10}
        x2={lineToNumber(line) * 20 - 8}
        y2={24}
        strokeWidth={2}
        stroke="black"
      />
    </>
  );
};

export default MuteMark;
