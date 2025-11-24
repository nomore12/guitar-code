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
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';

interface ControlUiProps {
  bpm: number;
  minBpm?: number;
  maxBpm?: number;
  onBpmChange: (value: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  restAccentEnabled: boolean;
  onRestAccentToggle: (enabled: boolean) => void;
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
}) => {
  return (
    <Card
      elevation={1}
      sx={{
        width: '100%',
        maxWidth: 960,
        mb: 3,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6" component="h2">
            리듬 컨트롤
          </Typography>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ md: 'center' }}
          >
            <Stack flex={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  BPM
                </Typography>
                <Typography variant="body1" fontWeight={600}>
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
              />
            </Stack>
            <Select defaultValue="step-1">
              <MenuItem value="step-1">Step 1</MenuItem>
              <MenuItem value="step-2">Step 2</MenuItem>
              <MenuItem value="step-3">Step 3</MenuItem>
              <MenuItem value="step-4">Step 4</MenuItem>
              <MenuItem value="step-5">Step 5</MenuItem>
              <MenuItem value="step-6">Step 6</MenuItem>
              <MenuItem value="step-7">Step 7</MenuItem>
              <MenuItem value="step-8">Step 8</MenuItem>
            </Select>

            <FormControlLabel
              control={
                <Switch
                  checked={restAccentEnabled}
                  onChange={(event) => onRestAccentToggle(event.target.checked)}
                />
              }
              label="4분 쉼표 강조"
            />

            <Button
              variant="contained"
              color={isPlaying ? 'error' : 'primary'}
              onClick={onTogglePlay}
              startIcon={isPlaying ? <Stop /> : <PlayArrow />}
              sx={{ minWidth: 120 }}
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
