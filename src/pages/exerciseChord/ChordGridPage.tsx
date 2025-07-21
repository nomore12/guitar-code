import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChordDisplay from './ChordDisplay';
import { chordData } from './chordData';
import {
  generateRandomChords,
  generateRandomChordsWithCategories,
  ChordGenerationMode,
  CHORD_PRESETS,
} from './randomChordGenerator';
import type { ChordCategories } from './randomChordGenerator';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: stretch;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
  align-items: center;
  max-width: 600px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
    gap: 6px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  justify-content: flex-start;

  input[type='checkbox'] {
    margin: 0;
    cursor: pointer;
    flex-shrink: 0;
  }

  &:hover {
    color: #007bff;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    justify-content: center;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  font-size: 0.9rem;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled(Button)`
  background-color: #007bff;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

const GenerateButton = styled(Button)`
  background-color: #28a745;

  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;

const ChordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  grid-template-rows: repeat(4, minmax(120px, 1fr));
  gap: 8px;
  justify-items: center;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, minmax(100px, 1fr));
    gap: 6px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, minmax(100px, 1fr));
    gap: 4px;
  }
`;

const ChordGridPage: React.FC = () => {
  const [hideFingers, setHideFingers] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [displayChords, setDisplayChords] = useState(chordData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ChordCategories>(
    {
      openPosition: true,
      barreChords: true,
      diminishedChords: false,
      minor7b5Chords: false,
      augmentedChords: false,
      sus4Chords: false,
      sixthChords: false,
    },
  );

  // 컴포넌트 마운트 시 랜덤하게 하나의 코드에 포커스
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 16);
    setFocusedIndex(randomIndex);
  }, []);

  // 코드 클릭 시 포커스 변경
  const handleChordClick = (index: number) => {
    setFocusedIndex(index);
  };

  const toggleHideFingers = () => {
    setHideFingers(!hideFingers);
  };

  // 체크박스 변경 핸들러
  const handleCategoryChange = (category: keyof ChordCategories) => {
    // 현재 선택된 카테고리 개수 확인
    const currentSelectedCount =
      Object.values(selectedCategories).filter(Boolean).length;

    // 마지막 하나를 비활성화하려고 하는 경우 방지
    if (currentSelectedCount === 1 && selectedCategories[category]) {
      alert('최소 1개 이상의 코드 카테고리를 선택해야 합니다.');
      return;
    }

    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 랜덤 코드 생성
  const generateNewChords = async () => {
    setIsGenerating(true);

    try {
      // 로딩 시뮬레이션 (실제로는 생성이 빠름)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newChords = generateRandomChordsWithCategories(selectedCategories);
      setDisplayChords(newChords);

      // 새로운 랜덤 포커스 설정
      const randomIndex = Math.floor(Math.random() * 16);
      setFocusedIndex(randomIndex);
    } catch (error) {
      console.error('코드 생성 실패:', error);
      // 실패 시 기본 코드로 복원
      setDisplayChords(chordData);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <h1>기타 코드 연습</h1>
        <ControlsContainer>
          <CheckboxGroup>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.openPosition}
                onChange={() => handleCategoryChange('openPosition')}
              />
              오픈포지션
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.barreChords}
                onChange={() => handleCategoryChange('barreChords')}
              />
              하이코드(5,6번줄)
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.diminishedChords}
                onChange={() => handleCategoryChange('diminishedChords')}
              />
              Diminished
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.minor7b5Chords}
                onChange={() => handleCategoryChange('minor7b5Chords')}
              />
              Minor7b5
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.augmentedChords}
                onChange={() => handleCategoryChange('augmentedChords')}
              />
              Augmented
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.sus4Chords}
                onChange={() => handleCategoryChange('sus4Chords')}
              />
              Sus4
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={selectedCategories.sixthChords}
                onChange={() => handleCategoryChange('sixthChords')}
              />
              6th 코드
            </CheckboxItem>
          </CheckboxGroup>
          <ButtonGroup>
            <GenerateButton onClick={generateNewChords} disabled={isGenerating}>
              {isGenerating ? '생성 중...' : '코드 생성'}
            </GenerateButton>
            <ToggleButton onClick={toggleHideFingers}>
              {hideFingers ? '운지법 보이기' : '운지법 숨기기'}
            </ToggleButton>
          </ButtonGroup>
        </ControlsContainer>
      </Header>

      <ChordGrid>
        {displayChords.map((chord, index) => (
          <div key={index} onClick={() => handleChordClick(index)}>
            <ChordDisplay
              chord={chord}
              focused={focusedIndex === index}
              hide={hideFingers}
            />
          </div>
        ))}
      </ChordGrid>
    </PageContainer>
  );
};

export default ChordGridPage;
