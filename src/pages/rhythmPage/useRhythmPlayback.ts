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
  octaves: 4,
  oscillator: { type: 'sine' as const },
  envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.08 },
};

const REST_VOICE = {
  noise: { type: 'pink' as const },
  envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.03 },
  volume: -8,
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
    const restSynth = new Tone.NoiseSynth(REST_VOICE).toDestination();
    let currentSlot = 0;

    const handleSlot = (slotIndex: number, time: number) => {
      const events = slotEventMap.get(slotIndex) ?? [];
      const hasNote = events.some((event) => event.kind === 'note');
      const hasRestForAccent =
        restAccentEnabled && events.some((event) => event.kind === 'rest');

      if (hasNote) {
        noteSynth.triggerAttackRelease('E1', '16n', time, 0.8);
      } else if (hasRestForAccent) {
        restSynth.triggerAttackRelease('16n', time, 0.5);
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
