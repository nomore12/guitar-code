import React, { useMemo } from 'react';
import { Bar, RhythmEvent } from './types';
import {
  computeNotePositions,
  computeFlagLevel,
  computeEffectiveLength,
  makeBeatGroupsFromBar,
  makeBeamGroups,
} from './rhythmUtils';
import { BAR_PADDING } from './layoutConstants';
import {
  NOTE8_PATH,
  NOTE16_PATH,
  NOTE4_PATH,
  NOTE_VIEWBOX_SIZE,
  REST4_PATH,
  REST8_PATH,
  REST16_PATH,
} from './noteExample';

interface RhythmLayerProps {
  bars: Bar[];
  barWidth: number;
  startX: number;
  y: number;
}

const NOTE_PATHS = {
  quarter: NOTE4_PATH,
  eighth: NOTE8_PATH,
  sixteenth: NOTE16_PATH,
};
const NOTE_PATH_ANCHOR_X = NOTE_VIEWBOX_SIZE * 0.55;
const NOTE_PATH_ANCHOR_Y = NOTE_VIEWBOX_SIZE * 0.75;
const REST_PATHS = {
  quarter: REST4_PATH,
  eighth: REST8_PATH,
  sixteenth: REST16_PATH,
};
const REST_PATH_ANCHOR_X = NOTE_VIEWBOX_SIZE * 0.5;
const REST_PATH_ANCHOR_Y = NOTE_VIEWBOX_SIZE * 0.65;

const renderNotePath = (
  path: string,
  key: string,
  x: number,
  y: number,
): JSX.Element => {
  const translateX = x - NOTE_PATH_ANCHOR_X;
  const translateY = y - NOTE_PATH_ANCHOR_Y;
  return (
    <path
      key={key}
      d={path}
      transform={`translate(${translateX}, ${translateY})`}
      fill="black"
    />
  );
};

const renderRestPath = (
  path: string,
  key: string,
  x: number,
  y: number,
): JSX.Element => {
  const translateX = x - REST_PATH_ANCHOR_X;
  const translateY = y - REST_PATH_ANCHOR_Y;
  return (
    <path
      key={key}
      d={path}
      transform={`translate(${translateX}, ${translateY})`}
      fill="black"
    />
  );
};

const collectBeamedEvents = (bars: Bar[]): Set<RhythmEvent> => {
  const beamed = new Set<RhythmEvent>();
  for (const bar of bars) {
    const beatGroups = makeBeatGroupsFromBar(bar.events, bar.beatsPerBar);
    for (const beatGroup of beatGroups) {
      const beamGroups = makeBeamGroups(beatGroup);
      for (const group of beamGroups) {
        if (group.notes.length < 2) continue;
        for (const note of group.notes) {
          beamed.add(note.event);
        }
      }
    }
  }
  return beamed;
};

const RhythmLayer: React.FC<RhythmLayerProps> = ({
  bars,
  barWidth,
  startX,
  y,
}) => {
  const beamedEvents = useMemo(() => collectBeamedEvents(bars), [bars]);

  return (
    <g>
      {bars.map((bar, barIndex) => {
        const { events, beatsPerBar } = bar;
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

          const eventKey = `bar-${barIndex}-event-${eventIndex}`;

          if (event.kind === 'rest') {
            const effectiveLength = computeEffectiveLength(event);
            let path = REST_PATHS.sixteenth;
            if (effectiveLength >= 4) {
              path = REST_PATHS.quarter;
            } else if (effectiveLength >= 2) {
              path = REST_PATHS.eighth;
            }
            return renderRestPath(path, eventKey, x, y);
          }

          const flagLevel = computeFlagLevel(event);
          const isBeamed = beamedEvents.has(event);

          if (!isBeamed && flagLevel > 0) {
            const path =
              flagLevel === 1 ? NOTE_PATHS.eighth : NOTE_PATHS.sixteenth;
            return renderNotePath(path, eventKey, x, y);
          }

          return renderNotePath(NOTE_PATHS.quarter, eventKey, x, y);
        });
      })}
    </g>
  );
};

export default RhythmLayer;
