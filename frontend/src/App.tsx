import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './Pages/Home';
import Modules from './Pages/Modules';
import StudyPlanner from './Pages/StudyPlanner';
import Projects from './Pages/Projects';
import Settings from './Pages/Settings';
import BottomNav from './Components/BottomNav';
import Login from './Pages/login';

// Creating a dark theme with purple highlights
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#bb86fc', // A light purple
    },
    secondary: {
      main: '#03dac6', // Teal for secondary actions
    },
    background: {
      default: '#121212', // Very dark gray, almost black
      paper: '#1e1e1e', // Slightly lighter gray for paper elements
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />  {/* Ensures that the background color covers the whole page */}
      <BrowserRouter>
        <div>
          {/* Routes setup */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/study-planner" element={<StudyPlanner />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          {/* Bottom navigation */}
          <BottomNav />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
