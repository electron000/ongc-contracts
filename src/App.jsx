import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leaderboard from './pages/leaderboard/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/leaderboard" element={<Leaderboard/>} />
        <Route path="*" element={<Navigate to="/leaderboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


