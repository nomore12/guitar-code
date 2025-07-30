import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const MainPage: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={4}
    >
      <Typography variant="h4" gutterBottom>
        Welcome to the Guitar Practice App
      </Typography>
      <Button
        component={Link}
        to="/chords"
        variant="contained"
        color="primary"
        size="large"
        sx={{ mb: 2 }}
      >
        코드 연습 페이지로 이동
      </Button>
      <Button
        component={Link}
        to="/exercise-chords"
        variant="contained"
        color="primary"
        size="large"
        sx={{ mb: 2 }}
      >
        코드 랜덤 연습 페이지로 이동
      </Button>
      <Button
        component={Link}
        to="/chromatic"
        variant="contained"
        color="secondary"
        size="large"
        sx={{ mb: 2 }}
      >
        크로매틱 연습
      </Button>
      <Button
        component={Link}
        to="/backingTracks"
        variant="contained"
        color="secondary"
        size="large"
        sx={{ mb: 2 }}
      >
        백킹트랙 플레이어 페이지로 이동
      </Button>
      <Button
        component={Link}
        to="/fretboard"
        variant="contained"
        color="secondary"
        size="large"
        sx={{ mb: 2 }}
      >
        프랫보드
      </Button>
    </Box>
  );
};

export default MainPage;
