import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box, Fade } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Landing from "./Pages/Landing";
import Modules from "./Pages/Modules";
import ModuleDetails from "./Pages/ModuleDetails";
import StudyPlanner from "./Pages/StudyPlanner";
import Projects from "./Pages/Projects";
import Settings from "./Pages/Settings";
import BottomNav from "./Components/BottomNav";
import Profile from "./Pages/Profile";
import Quiz from "./Pages/Quiz";
import "./App.css";

// Modern theme with bright purple highlights from the logo
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5500aa", // Dark purple from logo
      light: "#7733bb",
      dark: "#440088",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ddaaff", // Light purple from logo
      light: "#eeccff",
      dark: "#bb88dd",
      contrastText: "#5500aa",
    },
    background: {
      default: "#f8f5ff", // Very light purple tint for background
      paper: "#ffffff",    // White for cards and panels
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ffa000",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#388e3c",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <Fade in={loading} timeout={{ enter: 500, exit: 500 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      </Fade>
    );
  } // Display loading spinner with fade effect while checking auth

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures global dark mode */}
      <BrowserRouter>
        <div>
          <Routes>
            {/* Show Landing Page (Login & Signup) only if the user is NOT logged in */}
            <Route path="/" element={user ? <Navigate to="/modules" /> : <Landing />} />

            {/* Protected Routes: Only allow access if the user is authenticated */}
            <Route path="/modules" element={user ? <Modules /> : <Navigate to="/" />} />
            <Route path="/module-details" element={user ? <ModuleDetails /> : <Navigate to="/" />} />
            <Route path="/quiz" element={user ? <Quiz /> : <Navigate to="/" />} />
            <Route path="/study-planner" element={user ? <StudyPlanner /> : <Navigate to="/" />} />
            <Route path="/projects" element={user ? <Projects /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
          </Routes>

          {/* Show bottom navigation only if the user is logged in */}
          {user && <BottomNav />}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
