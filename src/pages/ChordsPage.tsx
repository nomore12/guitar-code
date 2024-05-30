import React, { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import Chords from '../components/Chords';
import chordsData from '../data/openChords.json';
import * as Tone from 'tone';

const ChordsPage = () => {
  return (
    <Flex gap="5" direction="column">
      <Box py="6">
        <Text size="9">Chords! Chord! Chords!</Text>
      </Box>
      <Box>
        <Flex gap="5" justify="center">
          <Box>
            <Text>현재 코드</Text>
            <Chords chord={chordsData.X} />
          </Box>
          <Box>
            <Text>다음 코드</Text>
            <Chords chord={chordsData.X} />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ChordsPage;
