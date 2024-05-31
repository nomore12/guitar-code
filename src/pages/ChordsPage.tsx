import React, { useState, useEffect, FormEvent } from 'react';
import { Box, Button, Flex, Radio, RadioGroup, Text } from '@radix-ui/themes';
import Chords from '../components/Chords';
import chordsData from '../data/openChords.json';
import * as Tone from 'tone';
import useTonePlayer from '../hooks/useToneHook';

const allChords: ChordsDataProps = chordsData as unknown as ChordsDataProps;

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const { isSoundLoaded, handlePlay, handleStop } = useTonePlayer(
    'sounds/Kick.wav',
    60
  );

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

  const playCallback = () => {
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
    <Flex gap="5" direction="column">
      <Box py="6">
        <Text size="9">Chords! Chord! Chords!</Text>
      </Box>
      <Box>
        <Flex gap="5" justify="center">
          <Box>
            <Text>현재 코드</Text>
            <Chords chord={currentChord} />
          </Box>
          <Box>
            <Text>다음 코드</Text>
            <Chords chord={nextChord} />
          </Box>
        </Flex>
      </Box>
      <Box>
        {isSoundLoaded && (
          <div className="control-wrapper">
            <Button onClick={() => handlePlay(playCallback)}>start</Button>
            <Button
              onClick={() => {
                handleStop();
                setCurrentIndex(0);
                setNextIndex(1);
              }}
            >
              stop
            </Button>
          </div>
        )}
      </Box>
      <Box>
        <Text size="5" m={10}>
          연습 방식
        </Text>
        <Flex gap="5" justify="center" wrap="wrap">
          <RadioGroup.Root defaultValue="1" onValueChange={handleChords}>
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
            <RadioGroup.Item value="14">랜덤(코드진행 중에서)</RadioGroup.Item>
          </RadioGroup.Root>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ChordsPage;
