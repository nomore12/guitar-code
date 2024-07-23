import React from 'react';
import './styles.css';
import Main from './pages/Main';
import ChordsPage from './pages/chordsPage/ChordsPage';
import DrumTest from './pages/DrumTest';

export default function App() {
  return (
    <div className="App">
      <ChordsPage />
      {/*<DrumTest />*/}
    </div>
  );
}
