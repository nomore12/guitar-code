import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import useNoteStore from '../../store/useNoteStore';

interface MetronomeEngineProps {
  bpm: number;
  beatType: number; // 몇 박자마다 첫 비트 강조 (예: 4면 4비트)
}

const MetronomeEngine: React.FC<MetronomeEngineProps> = ({ bpm, beatType }) => {
  const {
    isPracticePlaying,
    incrementCurrentNoteIndex,
    setIsPracticePlaying, // 오류 발생 시 스토어 상태 업데이트용
  } = useNoteStore();

  const loopRef = useRef<Tone.Loop | null>(null);
  const strongBeatSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const weakBeatSynthRef = useRef<Tone.NoiseSynth | null>(null); // 이전 highClickRef 역할
  const beatCounterRef = useRef<number>(0); // 현재 마디 내 비트 카운터가 아닌, 전체 비트 카운터
  const isMountedRef = useRef(true); // 컴포넌트 마운트/언마운트 상태 추적

  // BPM 변경 효과: Tone.Transport가 이미 시작된 경우에만 BPM을 동적으로 변경
  useEffect(() => {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.bpm.value = bpm;
      console.log(`MetronomeEngine: BPM dynamically updated to ${bpm}`);
    }
    // bpm 값만 변경될 때는 Transport를 재시작하거나 루프를 재생성하지 않음
  }, [bpm]);

  // 메트로놈 주 로직: isPracticePlaying, beatType 변경 시 Tone.js 설정 및 제어
  useEffect(() => {
    isMountedRef.current = true; // 마운트 시 true

    const cleanupToneObjects = () => {
      console.log('MetronomeEngine: Cleaning up Tone.js objects...');
      if (loopRef.current) {
        loopRef.current.stop(0).dispose();
        loopRef.current = null;
        console.log('MetronomeEngine: Loop disposed.');
      }
      // Transport는 다른 곳에서도 사용될 수 있으므로 stop/cancel만 호출
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      console.log('MetronomeEngine: Transport stopped and cancelled.');

      if (strongBeatSynthRef.current) {
        strongBeatSynthRef.current.dispose();
        strongBeatSynthRef.current = null;
        console.log('MetronomeEngine: Strong beat synth disposed.');
      }
      if (weakBeatSynthRef.current) {
        weakBeatSynthRef.current.dispose();
        weakBeatSynthRef.current = null;
        console.log('MetronomeEngine: Weak beat synth disposed.');
      }
      beatCounterRef.current = 0; // 비트 카운터 초기화
    };

    if (!isPracticePlaying) {
      cleanupToneObjects();
      return; // 연습 중이 아니면 여기서 종료
    }

    console.log(
      `MetronomeEngine: Initializing for isPracticePlaying=${isPracticePlaying}, BPM=${bpm}, BeatType=${beatType}`,
    );

    const initializeAndStartTone = async () => {
      try {
        await Tone.start(); // 사용자 인터랙션 후 오디오 컨텍스트 시작
        console.log('MetronomeEngine: AudioContext started.');

        // Synth 재생성 또는 재설정 (기존 객체가 있다면 dispose 후 새로 생성)
        if (strongBeatSynthRef.current) strongBeatSynthRef.current.dispose();
        strongBeatSynthRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.008,
          octaves: 2,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        }).toDestination();

        if (weakBeatSynthRef.current) weakBeatSynthRef.current.dispose();
        weakBeatSynthRef.current = new Tone.NoiseSynth({
          noise: { type: 'white', playbackRate: 1.5 }, // 약간 높은 톤의 클릭
          envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.05 },
        }).toDestination();
        console.log('MetronomeEngine: Synths created/recreated.');

        beatCounterRef.current = 0; // 루프 시작 전 항상 초기화

        // 루프 재생성 또는 재설정
        if (loopRef.current) {
          loopRef.current.stop(0).dispose();
        }
        loopRef.current = new Tone.Loop((time) => {
          if (
            !isMountedRef.current ||
            !strongBeatSynthRef.current ||
            !weakBeatSynthRef.current ||
            Tone.Transport.state !== 'started'
          ) {
            return; // 안전장치
          }

          const currentBeatInLoop = beatCounterRef.current % beatType; // 현재 루프 내에서의 비트
          const currentTotalBeatCount = beatCounterRef.current;

          // console.log(`[DEBUG MetronomeEngine] Loop callback: totalBeat=${currentTotalBeatCount}, currentBeatInLoop=${currentBeatInLoop}, isPracticePlaying=${useNoteStore.getState().isPracticePlaying}`);

          if (useNoteStore.getState().isPracticePlaying) {
            // 첫 번째 전체 비트(currentTotalBeatCount === 0)에서는 incrementCurrentNoteIndex를 호출하지 않음.
            // 두 번째 전체 비트부터 노트 인덱스 증가 시작.
            if (currentTotalBeatCount > 0) {
              // console.log('[DEBUG MetronomeEngine] Calling incrementCurrentNoteIndex');
              incrementCurrentNoteIndex();
            }
          }

          try {
            if (currentBeatInLoop === 0) {
              // 각 박자의 첫 비트
              strongBeatSynthRef.current.triggerAttackRelease(
                'C2',
                '16n',
                time,
              );
            } else {
              // 나머지 비트
              weakBeatSynthRef.current.triggerAttackRelease('32n', time);
            }
          } catch (e) {
            console.error('MetronomeEngine: Error in triggerAttackRelease:', e);
          }
          beatCounterRef.current++; // 전체 비트 카운터 증가
        }, '4n'); // '4n'은 각 비트의 간격 (BPM에 따라 실제 시간 결정됨)

        Tone.Transport.bpm.value = bpm; // 루프 시작 전 BPM 설정

        if (Tone.Transport.state !== 'started') {
          await Tone.Transport.start('+0.1'); // 약간의 딜레이 후 Transport 시작
          console.log('MetronomeEngine: Transport started.');
        } else {
          console.log('MetronomeEngine: Transport was already started.');
        }

        loopRef.current.start(0); // 루프 즉시 시작
        console.log('MetronomeEngine: Loop started.');
      } catch (error) {
        console.error(
          'MetronomeEngine: Error during Tone.js setup or start:',
          error,
        );
        if (isMountedRef.current) {
          setIsPracticePlaying(false); // 오류 발생 시 연습 중지 상태로 변경
        }
      }
    };

    initializeAndStartTone();

    // cleanup 함수: 컴포넌트 언마운트 또는 의존성 변경 전 호출
    return () => {
      isMountedRef.current = false; // 언마운트 시 false
      cleanupToneObjects();
      console.log('MetronomeEngine: useEffect cleanup finished.');
    };
  }, [
    isPracticePlaying,
    bpm,
    beatType,
    incrementCurrentNoteIndex,
    setIsPracticePlaying,
  ]); // bpm과 beatType을 의존성 배열에 추가

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default MetronomeEngine;
