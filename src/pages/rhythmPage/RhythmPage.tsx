import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import RhythmStaff from './RhythmStaff';
import { Bar, StageId, TrainingStage } from './types';
import ControlUi from './ControlUi';
import useRhythmPlayback, { ActivePosition } from './useRhythmPlayback';
import { RHYTHM_PRESETS } from './rhythmPresets';

const RhythmPageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px 0;

  .score-svg {
    width: 1200px;
    max-width: 100%;
  }
`;

const RhythmPage: React.FC = () => {
  const [bpm, setBpm] = useState(90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [restAccentEnabled, setRestAccentEnabled] = useState(true);
  const [stageId, setStageId] = useState<StageId>(1);

  const width = 1200;
  const height = 480;

  const marginLeft = 80;
  const marginRight = 40;
  const marginTop = 50;

  const staffCount = 4; // 기본 4줄
  const staffSpacing = 120;

  const barsPerStaff = 4;

  const presetOptions = useMemo(
    () =>
      RHYTHM_PRESETS.filter((stage: TrainingStage) => stage.id <= 3).map(
        (stage: TrainingStage) => ({
          id: stage.id,
          name: stage.name,
        }),
      ),
    [],
  );

  const activeStage = useMemo(
    () =>
      RHYTHM_PRESETS.find((stage: TrainingStage) => stage.id === stageId) ??
      (RHYTHM_PRESETS[0] as TrainingStage),
    [stageId],
  );
  const stageBars = activeStage.bars;
  const beatsPerBar = stageBars[0]?.beatsPerBar ?? 4;

  const totalBars = staffCount * barsPerStaff;
  const bars: Bar[] = useMemo(
    () =>
      Array.from(
        { length: totalBars },
        (_, i) => stageBars[i % stageBars.length],
      ),
    [stageBars, totalBars],
  );

  const staffBarData: Bar[][] = useMemo(
    () =>
      Array.from({ length: staffCount }, (_, staffIndex) =>
        bars.slice(staffIndex * barsPerStaff, (staffIndex + 1) * barsPerStaff),
      ),
    [bars, barsPerStaff, staffCount],
  );

  const innerWidth = width - marginLeft - marginRight;
  const barWidth = innerWidth / barsPerStaff;

  const staffYPositions = Array.from(
    { length: staffCount },
    (_, i) => marginTop + i * staffSpacing,
  );

  const [activePosition, setActivePosition] = useState<ActivePosition | null>(
    null,
  );

  const handleStageChange = (nextStageId: StageId) => {
    if (nextStageId === stageId) return;
    setIsPlaying(false);
    setStageId(nextStageId);
  };

  useRhythmPlayback({
    bars,
    beatsPerBar,
    bpm,
    isPlaying,
    restAccentEnabled,
    onPositionChange: setActivePosition,
  });

  return (
    <RhythmPageContainer>
      <ControlUi
        bpm={bpm}
        onBpmChange={setBpm}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        restAccentEnabled={restAccentEnabled}
        onRestAccentToggle={setRestAccentEnabled}
        stageId={stageId}
        onStageChange={handleStageChange}
        stageOptions={presetOptions}
      />
      <svg
        className="score-svg"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 템포 표시 */}
        <text x={marginLeft} y={16} fontSize={16} fontWeight="bold">
          ♩ = {bpm}
        </text>

        {/* 4/4 박자 표시 (첫 줄 왼쪽) */}
        <text
          x={marginLeft - 30}
          y={staffYPositions[0] + 18}
          fontSize={20}
          fontWeight="bold"
        >
          {beatsPerBar}
        </text>
        <line
          x1={marginLeft - 30}
          y1={staffYPositions[0] + 20}
          x2={marginLeft - 16}
          y2={staffYPositions[0] + 20}
          stroke="black"
          strokeWidth={2}
        />
        <text
          x={marginLeft - 30}
          y={staffYPositions[0] + 38}
          fontSize={20}
          fontWeight="bold"
        >
          4
        </text>

        {staffYPositions.map((y, staffIndex) => {
          const staffStartBarIndex = staffIndex * barsPerStaff;
          return (
            <RhythmStaff
              key={staffIndex}
              y={y + 20}
              staffIndex={staffIndex}
              startX={marginLeft}
              endX={width - marginRight}
              barsPerStaff={barsPerStaff}
              barWidth={barWidth}
              bars={staffBarData[staffIndex]}
              startBarIndex={staffStartBarIndex}
              activePosition={activePosition}
            />
          );
        })}
      </svg>
    </RhythmPageContainer>
  );
};

export default RhythmPage;
