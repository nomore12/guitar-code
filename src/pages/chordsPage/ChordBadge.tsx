import React, { useEffect, useState } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';

interface PropsType {
  chord: string;
  onDelete: () => void;
}

const pastelColors = [
  'hsl(0, 70%, 85%)',
  'hsl(18, 70%, 85%)',
  'hsl(36, 70%, 85%)',
  'hsl(54, 70%, 85%)',
  'hsl(72, 70%, 85%)',
  'hsl(90, 70%, 85%)',
  'hsl(108, 70%, 85%)',
  'hsl(126, 70%, 85%)',
  'hsl(144, 70%, 85%)',
  'hsl(162, 70%, 85%)',
  'hsl(180, 70%, 85%)',
  'hsl(198, 70%, 85%)',
  'hsl(216, 70%, 85%)',
  'hsl(234, 70%, 85%)',
  'hsl(252, 70%, 85%)',
  'hsl(270, 70%, 85%)',
  'hsl(288, 70%, 85%)',
  'hsl(306, 70%, 85%)',
  'hsl(324, 70%, 85%)',
  'hsl(342, 70%, 85%)',
];

const getRandomColor = (colors: string[]) => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const ChordBadge: React.FC<PropsType> = ({ chord, onDelete }) => {
  const [bgColor, setBgColor] = useState<string>(pastelColors[0]);

  useEffect(() => {
    setBgColor(getRandomColor(pastelColors));
  }, []);
  return (
    <Flex
      align="center"
      gap="1"
      style={{
        borderRadius: '6px',
        backgroundColor: bgColor,
        padding: '4px 20px 4px 8px',
        position: 'relative',
      }}
    >
      <Text size="2">{chord}</Text>
      <Box
        style={{
          cursor: 'pointer',
          position: 'absolute',
          top: '-2px',
          right: '8px',
        }}
        onClick={onDelete}
      >
        <svg
          width="6"
          height="6"
          viewBox="0 0 6 6"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="0" x2="6" y2="6" stroke="gray" strokeWidth="1" />
          <line x1="0" y1="6" x2="6" y2="0" stroke="gray" strokeWidth="1" />
        </svg>
      </Box>
    </Flex>
  );
};

export default ChordBadge;
