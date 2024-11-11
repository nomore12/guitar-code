import React from 'react';
import './styles.css';
import Main from './pages/Main';
import ChordsPage from './pages/chordsPage/ChordsPage';
import DrumTest from './pages/DrumTest';
import MainPage from './pages/MainPage';
import { Routes, Route, Link, BrowserRouter as Router } from 'react-router-dom';
import routes, { renderRoute } from './routes/Routes';

export default function App() {
  return (
    <div className="App">
      <Router>
        <Routes>{routes.map(renderRoute)}</Routes>
      </Router>
    </div>
  );
}
