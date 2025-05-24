import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  RadioGroup,
  Text,
  Tabs,
  Slider,
} from '@radix-ui/themes';
import Chords from '../../components/chords/Chords';
import chordsData from '../../data/openChords.json';
import useTonePlayer from '../../hooks/useTonePlayer';
import CustomChordDisplay from './CustomChordDisplay';
import { ChordShape, generateMajorChordShapes } from '../../utils/chordsUtils';
const dynatonicChords = [
  chordsData.C,
  chordsData.Dm,
  chordsData.Em,
  chordsData.F,
  chordsData.G,
  chordsData.Am,
  chordsData.Bdim,
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const getRandomElement = (arr: any[]) => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const chords = [
  [chordsData.C, chordsData.G, chordsData.Am, chordsData.F],
  [chordsData.C, chordsData.F, chordsData.G, chordsData.C],
  [chordsData.C, chordsData.Am, chordsData.Dm, chordsData.G],
  [chordsData.G, chordsData.D, chordsData.Em, chordsData.C],
  [chordsData.G, chordsData.C, chordsData.D, chordsData.G],
  [chordsData.G, chordsData.Em, chordsData.Am, chordsData.D],
  [chordsData.D, chordsData.A, chordsData.Bm, chordsData.G],
  [chordsData.D, chordsData.G, chordsData.A, chordsData.D],
  [chordsData.D, chordsData.Bm, chordsData.Em, chordsData.A],
  [chordsData.A, chordsData.E, chordsData['F#m'], chordsData.D],
  [chordsData.A, chordsData.D, chordsData.E, chordsData.A],
  [chordsData.A, chordsData['F#m'], chordsData.Bm, chordsData.E],
];

const ChordsPage = () => {
  const [currentChord, setCurrentChord] = useState<ChordProps>(chordsData.X);
  const [nextChord, setNextChord] = useState<ChordProps>(chordsData.X);
  const [chordArr, setChordArr] = useState<ChordProps[]>([]);
  const [, setCurrentIndex] = useState(0);
  const [, setNextIndex] = useState(1);
  const [bpm, setBpm] = useState<number>(60);
  const [volume, setVolume] = useState(10);
  const [beat, setBeat] = useState<'4' | '8' | '16'>('4');
  // const [shapes, setShapes] = useState<ChordShape[]>([]);

  const { handlePlay, handleStop } = useTonePlayer({
    bpm,
    volume,
    beat,
    callback: playCallback,
  });

  // const { handlePlay, handleStop } = useDrumPlayer({
  //   bpm,
  //   volume,
  //   beat: '8',
  //   callback: playCallback,
  // });

  useEffect(() => {
    const shuffle = shuffleArray(dynatonicChords);
    setChordArr(shuffle);
  }, []);

  function playCallback() {
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % chordArr.length;
      setCurrentChord(chordArr[newIndex]);
      return newIndex;
    });
    setNextIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % chordArr.length;
      setNextChord(chordArr[newIndex]);
      return newIndex;
    });
  }

  useEffect(() => {
    const shuffle = shuffleArray(dynatonicChords);
    setChordArr(shuffle);
  }, []);

  useEffect(() => {
    if (chordArr.length > 0) {
      setCurrentChord(chordArr[0]);
      setNextChord(chordArr[1]);
    }
  }, [chordArr]);

  // useEffect(() => {
  //   const chordShapes = generateMajorChordShapes('C');
  //   console.log(chordShapes);
  //   setShapes(chordShapes);
  // }, [currentChord]);

  const onChangeBpm = (value: number[]) => {
    if (value[0] < 40 || value[0] >= 300) {
      return;
    }
    setBpm(value[0]);
  };

  const handleChords = (value: string) => {
    switch (value) {
      case '1':
        setChordArr(shuffleArray(dynatonicChords));
        break;
      case '2':
        setChordArr(chords[0]);
        break;
      case '3':
        setChordArr(chords[1]);
        break;
      case '4':
        setChordArr(chords[2]);
        break;
      case '5':
        setChordArr(chords[3]);
        break;
      case '6':
        setChordArr(chords[4]);
        break;
      case '7':
        setChordArr(chords[5]);
        break;
      case '8':
        setChordArr(chords[6]);
        break;
      case '9':
        setChordArr(chords[7]);
        break;
      case '10':
        setChordArr(chords[8]);
        break;
      case '11':
        setChordArr(chords[9]);
        break;
      case '12':
        setChordArr(chords[10]);
        break;
      case '13':
        setChordArr(chords[11]);
        break;
      case '14':
        setChordArr(getRandomElement(chords));
        break;
      default:
        break;
    }
  };

  return (
    <Flex gap="5" direction="column" align="center">
      <Box py="6">
        <Text size="9">Chords! Chord! Chords!</Text>
      </Box>
      {/* 일단 실패... */}
      {/* <Box>
        {shapes &&
          shapes.map((item, index) => (
            <div key={index}>
              <Chords chord={item} />
            </div>
          ))}
      </Box> */}
      <Box>
        <Flex gap="5" justify="center">
          <Box>
            <Text>현재 코드</Text>
            {currentChord && <Chords chord={currentChord} />}
          </Box>
          <Box>
            <Text>다음 코드</Text>
            {nextChord && <Chords chord={nextChord} />}
          </Box>
        </Flex>
      </Box>
      <Box>
        {
          <Flex gap="4">
            <Button size="4" onClick={() => handlePlay()}>
              start
            </Button>
            <Button
              size="4"
              onClick={() => {
                handleStop();
                setCurrentIndex(0);
                setNextIndex(1);
              }}
            >
              stop
            </Button>
          </Flex>
        }
      </Box>
      <Box width="300px">
        <Flex align="center" justify="between" style={{ padding: '10px 0' }}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            BPM: {bpm}
          </Box>
          <Box
            style={{ display: 'flex', alignItems: 'center', width: '220px' }}
          >
            <Slider
              onValueChange={onChangeBpm}
              value={[bpm]}
              style={{ maxWidth: '240px' }}
              max={300}
            />
          </Box>
        </Flex>
        <Flex align="center" justify="between" style={{ padding: '10px 0' }}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            볼륨: {volume}
          </Box>
          <Box
            style={{ display: 'flex', alignItems: 'center', width: '220px' }}
          >
            <Slider
              onValueChange={(value) => setVolume(value[0])}
              value={[volume]}
              style={{ maxWidth: '240px' }}
              max={30}
            />
          </Box>
        </Flex>
        <RadioGroup.Root
          defaultValue="1"
          onValueChange={(value) => {
            const selectedBeat =
              value === '1' ? '4' : value === '2' ? '8' : '16';
            setBeat(selectedBeat);
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
          }}
        >
          <RadioGroup.Item value="1">4 beat</RadioGroup.Item>
          <RadioGroup.Item value="2">8 beat</RadioGroup.Item>
        </RadioGroup.Root>
      </Box>
      <Box>
        <Text size="5" m="10">
          연습 방식
        </Text>
        <Tabs.Root defaultValue="chordsArr">
          <Tabs.List style={{ width: '692px' }}>
            <Tabs.Trigger value="chordsArr">코드 진행</Tabs.Trigger>
            <Tabs.Trigger value="customs">코드 직접 입력</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="chordsArr">
            <Flex gap="5" justify="center" wrap="wrap" style={{ padding: 16 }}>
              <RadioGroup.Root
                defaultValue="1"
                onValueChange={handleChords}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr', // 4열로 구성
                  gap: '10px', // 원하는 간격 설정
                }}
              >
                <RadioGroup.Item value="1">랜덤(다이아토닉)</RadioGroup.Item>
                <RadioGroup.Item value="2">C - G - Am - F</RadioGroup.Item>
                <RadioGroup.Item value="3">C - F - G - C</RadioGroup.Item>
                <RadioGroup.Item value="4">C - Am - Dm - G</RadioGroup.Item>
                <RadioGroup.Item value="5">G - D - Em - C</RadioGroup.Item>
                <RadioGroup.Item value="6">G - C - D - G</RadioGroup.Item>
                <RadioGroup.Item value="7">G - Em - Am - D</RadioGroup.Item>
                <RadioGroup.Item value="8">D - A - Bm - G</RadioGroup.Item>
                <RadioGroup.Item value="9">D - G - A - D</RadioGroup.Item>
                <RadioGroup.Item value="10">D - Bm - Em - A</RadioGroup.Item>
                <RadioGroup.Item value="11">A - E - F#m - D</RadioGroup.Item>
                <RadioGroup.Item value="12">A - D - E - A</RadioGroup.Item>
                <RadioGroup.Item value="13">A - F#m - Bm - E</RadioGroup.Item>
                <RadioGroup.Item value="14">
                  랜덤(코드진행 중에서)
                </RadioGroup.Item>
              </RadioGroup.Root>
            </Flex>
          </Tabs.Content>
          <Tabs.Content value="customs">
            <CustomChordDisplay setCustomChords={setChordArr} />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Flex>
  );
};

export default ChordsPage;
