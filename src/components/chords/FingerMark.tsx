import React from "react";
import { lineToNumber } from "../../utils/chordsUtils";

interface PropsType {
  line: number;
  flat: number;
}

const FingerMark: React.FC<PropsType> = ({ line, flat }) => {
  return (
    <circle
      cx={lineToNumber(line) * 20}
      cy={15 + flat * 30}
      r="8"
      fill="black"
    />
  );
};

export default FingerMark;
