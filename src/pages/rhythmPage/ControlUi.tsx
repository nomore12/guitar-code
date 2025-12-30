import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Slider,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { PlayArrow, Stop, Shuffle } from '@mui/icons-material';
import { StageId } from './types';

interface ControlUiProps {
  bpm: number;
  minBpm?: number;
  maxBpm?: number;
  onBpmChange: (value: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  restAccentEnabled: boolean;
  onRestAccentToggle: (enabled: boolean) => void;
  stageId: StageId;
  onStageChange: (stage: StageId) => void;
  stageOptions: { id: StageId; name: string }[];
  onRegenerate: () => void;
}

const ControlUi: React.FC<ControlUiProps> = ({
  bpm,
  minBpm = 40,
  maxBpm = 220,
  onBpmChange,
  isPlaying,
  onTogglePlay,
  restAccentEnabled,
  onRestAccentToggle,
  stageId,
  onStageChange,
  stageOptions,
  onRegenerate,
}) => {
  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: 1200,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ py: 3, px: 4 }}>
        <Stack spacing={3}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, textAlign: 'center' }}
          >
            🎵 리듬 트레이닝
          </Typography>

          {/* Main Controls Row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* BPM Slider */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  BPM
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {bpm}
                </Typography>
              </Stack>
              <Slider
                value={bpm}
                onChange={(_, value) => onBpmChange(value as number)}
                min={minBpm}
                max={maxBpm}
                step={1}
                valueLabelDisplay="auto"
                aria-label="BPM Slider"
                sx={{
                  color: 'white',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                }}
              />
            </Box>

            {/* Stage Selection */}
            <Select
              value={stageId}
              onChange={(event) => onStageChange(event.target.value as StageId)}
              size="small"
              sx={{
                minWidth: 120,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: 2,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              {stageOptions.map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>
                  {stage.name}
                </MenuItem>
              ))}
            </Select>

            {/* Random Button */}
            <Tooltip title="새로운 패턴 생성">
              <IconButton
                onClick={onRegenerate}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  color: 'white',
                }}
              >
                <Shuffle />
              </IconButton>
            </Tooltip>

            {/* Rest Accent Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={restAccentEnabled}
                  onChange={(event) => onRestAccentToggle(event.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  쉼표 강조
                </Typography>
              }
            />

            {/* Play/Stop Button */}
            <Button
              variant="contained"
              color={isPlaying ? 'error' : 'success'}
              onClick={onTogglePlay}
              startIcon={isPlaying ? <Stop /> : <PlayArrow />}
              sx={{
                minWidth: 120,
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 5,
                },
              }}
            >
              {isPlaying ? '정지' : '재생'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ControlUi;
