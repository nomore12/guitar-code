import React, { useMemo } from 'react';
import { Bar, RhythmEvent } from './types';
import { makeBeatGroupsFromBar, makeBeamGroups } from './rhythmUtils';
import {
  BAR_PADDING_LEFT,
  BAR_PADDING_RIGHT,
  BEAT_GAP,
} from './layoutConstants';
import BeatRenderer from './BeatRenderer';

interface RhythmLayerProps {
  bars: Bar[];
  barWidth: number;
  startX: number;
  y: number;
}

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
        const innerStartX = barX + BAR_PADDING_LEFT;
        const innerWidth = barWidth - BAR_PADDING_LEFT - BAR_PADDING_RIGHT;
        const beatWidth =
          (innerWidth - BEAT_GAP * (beatsPerBar - 1)) / beatsPerBar;
        const beatGroups = makeBeatGroupsFromBar(events, beatsPerBar);

        return (
          <g key={`bar-${barIndex}`}>
            {beatGroups.map((beatGroup) => {
              const beatIndex = beatGroup.beatIndex;
              const beatBaseX =
                innerStartX + beatIndex * (beatWidth + BEAT_GAP);
              return (
                <BeatRenderer
                  key={`bar-${barIndex}-beat-${beatIndex}`}
                  beatIndex={beatIndex}
                  startX={beatBaseX}
                  width={beatWidth}
                  y={y}
                  events={beatGroup.events}
                  isBeamed={(event) => beamedEvents.has(event)}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

export default RhythmLayer;
