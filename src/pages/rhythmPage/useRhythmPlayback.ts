import { useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { Bar, RhythmEvent } from './types';
import { SLOTS_PER_BEAT, computeEffectiveLength } from './rhythmUtils';

export interface ActivePosition {
  barIndex: number;
  beatIndex: number;
  slotInBeat: number;
  slotIndex: number;
}

interface UseRhythmPlaybackOptions {
  bars: Bar[];
  beatsPerBar: number;
  bpm: number;
  isPlaying: boolean;
  restAccentEnabled: boolean;
  onPositionChange?: (position: ActivePosition | null) => void;
}

const NOTE_VOICE = {
  pitchDecay: 0.01,
  octaves: 2,
  oscillator: { type: 'triangle' as const },
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 },
};

const REST_VOICE = {
  harmonicity: 4,
  modulationIndex: 32,
  resonance: 4000,
  octaves: 0.5,
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
};

const useRhythmPlayback = ({
  bars,
  beatsPerBar,
  bpm,
  isPlaying,
  restAccentEnabled,
  onPositionChange,
}: UseRhythmPlaybackOptions) => {
  const slotsPerBar = beatsPerBar * SLOTS_PER_BEAT;
  const totalSlots = slotsPerBar * bars.length;

  const slotEventMap = useMemo(() => {
    const map = new Map<number, RhythmEvent[]>();
    bars.forEach((bar, barIndex) => {
      const baseSlot = barIndex * slotsPerBar;
      bar.events.forEach((event) => {
        const slotIndex = baseSlot + event.start;
        if (!map.has(slotIndex)) {
          map.set(slotIndex, []);
        }
        map.get(slotIndex)!.push(event);
      });
    });
    return map;
  }, [bars, slotsPerBar]);

  useEffect(() => {
    if (!isPlaying || totalSlots === 0) {
      onPositionChange?.(null);
      Tone.getTransport().stop();
      return;
    }

    let isDisposed = false;
    const noteSynth = new Tone.MembraneSynth(NOTE_VOICE).toDestination();
    const restSynth = new Tone.MetalSynth(REST_VOICE).toDestination();
    let currentSlot = 0;

    const handleSlot = (slotIndex: number, time: number) => {
      const events = slotEventMap.get(slotIndex) ?? [];
      const hasNote = events.some((event) => event.kind === 'note');
      const hasQuarterRest =
        restAccentEnabled &&
        events.some(
          (event) =>
            event.kind === 'rest' &&
            computeEffectiveLength(event) >= SLOTS_PER_BEAT,
        );

      if (hasNote) {
        noteSynth.triggerAttackRelease('C2', '16n', time);
      } else if (hasQuarterRest) {
        restSynth.triggerAttackRelease('8n', time);
      }

      const barIndex = Math.floor(slotIndex / slotsPerBar);
      const slotInBar = slotIndex % slotsPerBar;
      const beatIndex = Math.floor(slotInBar / SLOTS_PER_BEAT);
      const slotInBeat = slotInBar % SLOTS_PER_BEAT;

      onPositionChange?.({
        barIndex,
        beatIndex,
        slotInBeat,
        slotIndex,
      });
    };

    const loop = new Tone.Loop((time) => {
      if (isDisposed) return;
      handleSlot(currentSlot, time);
      currentSlot = (currentSlot + 1) % totalSlots;
    }, '16n');

    const startTransport = async () => {
      await Tone.start();
      const transport = Tone.getTransport();
      transport.stop();
      transport.position = 0;
      transport.bpm.value = bpm;
      loop.start(0);
      transport.start();
    };

    startTransport();

    return () => {
      isDisposed = true;
      loop.stop();
      loop.dispose();
      noteSynth.dispose();
      restSynth.dispose();
      Tone.getTransport().stop();
      onPositionChange?.(null);
    };
  }, [
    bars,
    bpm,
    isPlaying,
    onPositionChange,
    restAccentEnabled,
    slotEventMap,
    slotsPerBar,
    totalSlots,
  ]);
};

export default useRhythmPlayback;
