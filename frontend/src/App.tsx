// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import StudyPlanner from './Pages/StudyPlanner';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/study-planner" element={<StudyPlanner />} />
      </Routes>
    </Router>
  );
};

export default App;
