import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Replacing Settings with Profile

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current route

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const getIconColor = (path: string) => {
    return location.pathname === path ? "primary.main" : "action.active";
  };

  return (
    <BottomNavigation
      value={location.pathname}
      onChange={handleChange}
      showLabels
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        bgcolor: "background.paper", // Use theme's paper background
        paddingBottom: "env(safe-area-inset-bottom, 16px)", // Uses iOS safe area if available, or 16px as fallback
        marginBottom: 0,
        zIndex: 1000, // Ensure it stays on top of other content
      }}
    >
      <BottomNavigationAction
        label="Home"
        value="/"
        icon={<HomeIcon sx={{ color: getIconColor("/") }} />}
      />
      <BottomNavigationAction
        label="Modules"
        value="/modules"
        icon={<ListAltIcon sx={{ color: getIconColor("/modules") }} />}
      />
      <BottomNavigationAction
        label="Study Planner"
        value="/study-planner"
        icon={<EventNoteIcon sx={{ color: getIconColor("/study-planner") }} />}
      />
      <BottomNavigationAction
        label="Projects"
        value="/projects"
        icon={<WorkOutlineIcon sx={{ color: getIconColor("/projects") }} />}
      />
      {/* Profile */}
      <BottomNavigationAction
        label="Profile"
        value="/profile"
        icon={<AccountCircleIcon sx={{ color: getIconColor("/profile") }} />}
      />
    </BottomNavigation>
  );
};

export default BottomNav;
