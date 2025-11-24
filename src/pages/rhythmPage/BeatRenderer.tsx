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
  SLOT_HIGHLIGHT_OPACITY,
  NOTE_DOT_OFFSET_X,
  NOTE_DOT_OFFSET_Y,
  NOTE_DOT_RADIUS,
} from './layoutConstants';

interface BeatRendererProps {
  beatIndex: number;
  startX: number;
  width: number;
  y: number;
  events: RhythmEvent[];
  isBeamed: (event: RhythmEvent) => boolean;
  isActive: boolean;
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
  isActive,
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
        fillOpacity={isActive ? SLOT_HIGHLIGHT_OPACITY : 0}
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
            <g key={key}>
              <path
                d={restPath}
                transform={`translate(${
                  eventX - REST_PATH_ANCHOR_X
                }, ${y - REST_PATH_ANCHOR_Y})`}
                fill="black"
              />
              {event.dots
                ? Array.from({ length: event.dots }, (_, dotIndex) => {
                    const dotX =
                      eventX + NOTE_DOT_OFFSET_X + dotIndex * NOTE_DOT_OFFSET_X;
                    const dotY = y - NOTE_DOT_OFFSET_Y;
                    return (
                      <circle
                        key={`${key}-rest-dot-${dotIndex}`}
                        cx={dotX}
                        cy={dotY}
                        r={NOTE_DOT_RADIUS}
                        fill="black"
                      />
                    );
                  })
                : null}
            </g>
          );
        }

        const flagLevel = computeFlagLevel(event);
        const notePath =
          flagLevel === 0
            ? NOTE_PATHS.quarter
            : flagLevel === 1
              ? NOTE_PATHS.eighth
              : NOTE_PATHS.sixteenth;

        const baseTransform = `translate(${eventX - NOTE_PATH_ANCHOR_X}, ${
          y - NOTE_PATH_ANCHOR_Y
        })`;
        const glyphPath =
          isBeamed(event) || flagLevel === 0 ? NOTE_PATHS.quarter : notePath;

        return (
          <g key={key}>
            <path d={glyphPath} transform={baseTransform} fill="black" />
            {event.dots
              ? Array.from({ length: event.dots }, (_, dotIndex) => {
                  const dotX =
                    eventX + NOTE_DOT_OFFSET_X + dotIndex * NOTE_DOT_OFFSET_X;
                  const dotY = y - NOTE_DOT_OFFSET_Y;
                  return (
                    <circle
                      key={`${key}-dot-${dotIndex}`}
                      cx={dotX}
                      cy={dotY}
                      r={NOTE_DOT_RADIUS}
                      fill="black"
                    />
                  );
                })
              : null}
          </g>
        );
      })}
    </g>
  );
};

export default BeatRenderer;
