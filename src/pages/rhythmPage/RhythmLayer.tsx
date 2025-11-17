import React from 'react';
import { RhythmEvent } from './types';
import { computeNotePositions, computeFlagLevel } from './rhythmUtils';
import {
  NOTE4_PATH,
  NOTE8_PATH,
  NOTE16_PATH,
  NOTE_VIEWBOX_SIZE,
} from './noteExample';

interface RhythmLayerProps {
  bars: RhythmEvent[][];
  barWidth: number;
  beatsPerBar: number;
  startX: number;
  y: number;
}

const BAR_PADDING = 12;
const NOTE_SCALE = 1;
const NOTE_ANCHOR_X = NOTE_VIEWBOX_SIZE * 0.55;
const NOTE_ANCHOR_Y = NOTE_VIEWBOX_SIZE * 0.72;
const NOTE_SHAPES = [NOTE4_PATH, NOTE8_PATH, NOTE16_PATH];

const RhythmLayer: React.FC<RhythmLayerProps> = ({
  bars,
  barWidth,
  beatsPerBar,
  startX,
  y,
}) => {
  return (
    <g>
      {bars.map((events, barIndex) => {
        const barX = startX + barIndex * barWidth;
        const innerStartX = barX + BAR_PADDING;
        const innerWidth = barWidth - BAR_PADDING * 2;
        const positions = computeNotePositions(
          events,
          innerStartX,
          innerWidth,
          beatsPerBar,
        );

        return events.map((event, eventIndex) => {
          const x = positions.get(event);
          if (!x) return null;

          if (event.kind === 'note') {
            const flagLevel = computeFlagLevel(event);
            const shapeIndex = Math.min(flagLevel, NOTE_SHAPES.length - 1);
            const pathData = NOTE_SHAPES[shapeIndex];
            const translateX = x - NOTE_ANCHOR_X * NOTE_SCALE;
            const translateY = y - NOTE_ANCHOR_Y * NOTE_SCALE;

            return (
              <path
                key={`bar-${barIndex}-event-${eventIndex}`}
                d={pathData}
                transform={`translate(${translateX}, ${translateY - 2}) scale(${NOTE_SCALE})`}
                fill="black"
              />
            );
          }

          return null;
        });
      })}
    </g>
  );
};

export default RhythmLayer;
