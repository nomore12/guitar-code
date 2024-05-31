import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Radio, Text } from '@radix-ui/themes';
import Chords from '../components/Chords';
import chordsData from '../data/openChords.json';
import * as Tone from 'tone';
import useTonePlayer from '../hooks/useToneHook';

const allChords: ChordsData = chordsData as unknown as ChordsData;

const dynatonicChords = [
  chordsData.C,
  chordsData.Dm,
  chordsData.Em,
  chordsData.F,
  chordsData.G,
  chordsData.Am,
  chordsData.Bdim,
];

const getRandomElement = (arr: any[]) => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const ChordsPage = () => {
  const [currentChord, setCurrentChord] = useState<Chord>(chordsData.X);
  const [nextChord, setNextChord] = useState<Chord>(chordsData.X);

  const [chordArr, setChordArr] = useState<Chord[]>([...dynatonicChords]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  const { isSoundLoaded, handlePlay, handleStop } = useTonePlayer(
    'sounds/Kick.wav',
    60
  );

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
        <Text size="5" m={10}>
          연습 방식
        </Text>
        <Flex gap="5" justify="center">
          <Text>
            <Radio name="mode" value="1" defaultChecked />
            다이아토닉
          </Text>
          <Text>
            <Radio name="mode" value="2" />
            직접 입력
          </Text>
          <Text>
            <Radio name="mode" value="3" />
            랜덤
          </Text>
        </Flex>
      </Box>
      <Box>
        {isSoundLoaded && (
          <div className="control-wrapper">
            <Button onClick={() => handlePlay(playCallback)}>start</Button>
            <Button onClick={handleStop}>stop</Button>
          </div>
        )}
      </Box>
    </Flex>
  );
};

export default ChordsPage;
