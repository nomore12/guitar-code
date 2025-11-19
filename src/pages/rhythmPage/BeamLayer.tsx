import React from 'react';
import { Bar, BeamSegment, RhythmEvent } from './types';
import {
  makeBeatGroupsFromBar,
  makeBeamGroups,
  computeBeamSegments,
  computeEventRenderX,
} from './rhythmUtils';
import {
  BAR_PADDING_LEFT,
  BAR_PADDING_RIGHT,
  STEM_OFFSET_X,
  STEM_LENGTH,
  BEAM_THICKNESS,
  BEAM_GAP,
  SLOT_HIGHLIGHT_MARGIN,
  BEAT_GAP,
} from './layoutConstants';

interface BeamLayerProps {
  bars: Bar[];
  barWidth: number;
  startX: number;
  y: number;
}

const EPSILON = 0.01;

const splitSegmentByBeats = (
  segment: BeamSegment,
  beatBoundaries: number[],
): BeamSegment[] => {
  const { fromX, toX, level } = segment;
  const relevantBoundaries = beatBoundaries.filter(
    (boundary) => boundary > fromX + EPSILON && boundary < toX - EPSILON,
  );

  if (relevantBoundaries.length === 0) {
    return [segment];
  }

  const pieces: BeamSegment[] = [];
  let currentStart = fromX;
  for (const boundary of relevantBoundaries) {
    pieces.push({ level, fromX: currentStart, toX: boundary, y: segment.y });
    currentStart = boundary;
  }
  pieces.push({ level, fromX: currentStart, toX: toX, y: segment.y });
  return pieces;
};

const BeamLayer: React.FC<BeamLayerProps> = ({ bars, barWidth, startX, y }) => {
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
        const highlightWidth = Math.max(
          beatWidth - SLOT_HIGHLIGHT_MARGIN * 2,
          0,
        );
        const beatBoundaries: number[] = [];
        for (let i = 0; i < beatsPerBar; i++) {
          const start =
            innerStartX + i * (beatWidth + BEAT_GAP) + SLOT_HIGHLIGHT_MARGIN;
          beatBoundaries.push(start);
        }
        beatBoundaries.push(
          innerStartX +
            (beatsPerBar - 1) * (beatWidth + BEAT_GAP) +
            SLOT_HIGHLIGHT_MARGIN +
            highlightWidth,
        );

        return beatGroups.flatMap((beatGroup) => {
          const beamGroups = makeBeamGroups(beatGroup);

          return beamGroups.flatMap((group) => {
            const beatBaseX =
              innerStartX + beatGroup.beatIndex * (beatWidth + BEAT_GAP);
            const localPositions = new Map<RhythmEvent, number>();
            group.notes.forEach(({ event }) => {
              localPositions.set(
                event,
                computeEventRenderX(event, beatBaseX, beatWidth),
              );
            });
            const segments = computeBeamSegments(group, localPositions).flatMap(
              (segment) => splitSegmentByBeats(segment, beatBoundaries),
            );

            return segments.map((segment, segmentIndex) => {
              const baseY = y - STEM_LENGTH;
              const levelOffset =
                segment.level === 1 ? +6 : +4 + (BEAM_THICKNESS + BEAM_GAP);
              const beamY = baseY + levelOffset;

              return (
                <line
                  key={`bar-${barIndex}-beat-${beatGroup.beatIndex}-segment-${segmentIndex}-level-${segment.level}`}
                  x1={segment.fromX + STEM_OFFSET_X - 2}
                  x2={segment.toX + STEM_OFFSET_X - 5}
                  y1={beamY}
                  y2={beamY}
                  stroke="black"
                  strokeWidth={BEAM_THICKNESS}
                  strokeLinecap="round"
                />
              );
            });
          });
        });
      })}
    </g>
  );
};

export default BeamLayer;
