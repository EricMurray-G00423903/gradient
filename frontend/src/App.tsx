import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";  // Ensure Firebase is imported
import Landing from "./Pages/Landing";  // Now handles login & signup
import Modules from "./Pages/Modules";
import ModuleDetails from "./Pages/ModuleDetails";
import StudyPlanner from "./Pages/StudyPlanner";
import Projects from "./Pages/Projects";
import Settings from "./Pages/Settings";
import BottomNav from "./Components/BottomNav";
import Profile from "./Pages/Profile";
import Quiz from "./Pages/Quiz";
import "./App.css";  // ✅ Import global styles

// Creating a dark theme with purple highlights
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#bb86fc",
    },
    secondary: {
      main: "#03dac6",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>; // Display loading state while checking auth

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
