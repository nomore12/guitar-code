import React from 'react';
import { RhythmEvent } from './types';
import {
  computeFlagLevel,
  computeEffectiveLength,
  computeEventRenderX,
} from './rhythmUtils';
import {
  NOTE4_PATH,
  NOTE8_PATH,
  NOTE16_PATH,
  NOTE_VIEWBOX_SIZE,
  REST4_PATH,
  REST8_PATH,
  REST16_PATH,
} from './noteExample';
import {
  SLOT_HIGHLIGHT_OFFSET,
  SLOT_HIGHLIGHT_HEIGHT,
  SLOT_HIGHLIGHT_RADIUS,
  SLOT_HIGHLIGHT_MARGIN,
  SLOT_HIGHLIGHT_EXTRA_MARGIN,
} from './layoutConstants';

interface BeatRendererProps {
  beatIndex: number;
  startX: number;
  width: number;
  y: number;
  events: RhythmEvent[];
  isBeamed: (event: RhythmEvent) => boolean;
}

const NOTE_PATHS = {
  quarter: NOTE4_PATH,
  eighth: NOTE8_PATH,
  sixteenth: NOTE16_PATH,
};

const REST_PATHS = {
  quarter: REST4_PATH,
  eighth: REST8_PATH,
  sixteenth: REST16_PATH,
};

const NOTE_PATH_ANCHOR_X = NOTE_VIEWBOX_SIZE / 2 + 2;
const NOTE_PATH_ANCHOR_Y = NOTE_VIEWBOX_SIZE * 0.75;
const REST_PATH_ANCHOR_X = NOTE_VIEWBOX_SIZE / 2;
const REST_PATH_ANCHOR_Y = NOTE_VIEWBOX_SIZE * 0.65;

const BeatRenderer: React.FC<BeatRendererProps> = ({
  beatIndex,
  startX,
  width,
  y,
  events,
  isBeamed,
}) => {
  const highlightX =
    startX + SLOT_HIGHLIGHT_MARGIN + SLOT_HIGHLIGHT_EXTRA_MARGIN;
  const highlightWidth = Math.max(
    width - (SLOT_HIGHLIGHT_MARGIN + SLOT_HIGHLIGHT_EXTRA_MARGIN) * 2,
    0,
  );

  return (
    <g>
      <rect
        x={highlightX}
        y={y - SLOT_HIGHLIGHT_OFFSET}
        width={highlightWidth}
        height={SLOT_HIGHLIGHT_HEIGHT}
        rx={SLOT_HIGHLIGHT_RADIUS}
        fill="black"
        fillOpacity={0.12}
      />

      {events.map((event, eventIndex) => {
        const effectiveLength = computeEffectiveLength(event);
        const eventX = computeEventRenderX(event, startX, width);

        const key = `beat-${beatIndex}-event-${eventIndex}`;
        if (event.kind === 'rest') {
          let restPath = REST_PATHS.sixteenth;
          if (effectiveLength >= 4) restPath = REST_PATHS.quarter;
          else if (effectiveLength >= 2) restPath = REST_PATHS.eighth;
          return (
            <path
              key={key}
              d={restPath}
              transform={`translate(${
                eventX - REST_PATH_ANCHOR_X
              }, ${y - REST_PATH_ANCHOR_Y})`}
              fill="black"
            />
          );
        }

        const flagLevel = computeFlagLevel(event);
        const notePath =
          flagLevel === 0
            ? NOTE_PATHS.quarter
            : flagLevel === 1
              ? NOTE_PATHS.eighth
              : NOTE_PATHS.sixteenth;

        // Beamed notes stay quarter-style; single notes use note type path.
        if (isBeamed(event) || flagLevel === 0) {
          return (
            <path
              key={key}
              d={NOTE_PATHS.quarter}
              transform={`translate(${eventX - NOTE_PATH_ANCHOR_X}, ${
                y - NOTE_PATH_ANCHOR_Y
              })`}
              fill="black"
            />
          );
        }

        return (
          <path
            key={key}
            d={notePath}
            transform={`translate(${eventX - NOTE_PATH_ANCHOR_X}, ${
              y - NOTE_PATH_ANCHOR_Y
            })`}
            fill="black"
          />
        );
      })}
    </g>
  );
};

export default BeatRenderer;
