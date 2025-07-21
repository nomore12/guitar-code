import React from 'react';
import styled from 'styled-components';
import Chords from '../../components/chords/Chords';

interface ChordDisplayProps {
  chord: {
    chord: string;
    fingers: number[][];
    mute: number[] | [];
    flat: number;
  };
  focused?: boolean;
  hide?: boolean;
}

interface StyledWrapperProps {
  $focused?: boolean;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$focused ? 1 : 0.5)};
  transform: ${(props) => (props.$focused ? 'scale(0.42)' : 'scale(0.4)')};
  filter: ${(props) => (props.$focused ? 'none' : 'blur(1px)')};
  cursor: pointer;
  transform-origin: center center;

  &:hover {
    opacity: ${(props) => (props.$focused ? 1 : 0.7)};
    filter: none;
  }
`;

const HiddenFingerWrapper = styled.div`
  svg {
    circle {
      display: none;
    }
  }
`;

const ChordDisplay: React.FC<ChordDisplayProps> = ({
  chord,
  focused = false,
  hide = false,
}) => {
  if (hide) {
    // hide가 true일 때는 운지법을 숨기고 코드 이름과 격자만 표시
    return (
      <StyledWrapper $focused={focused}>
        <HiddenFingerWrapper>
          <Chords chord={chord} />
        </HiddenFingerWrapper>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper $focused={focused}>
      <Chords chord={chord} />
    </StyledWrapper>
  );
};

export default ChordDisplay;
