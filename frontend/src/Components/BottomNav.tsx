import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SettingsIcon from '@mui/icons-material/Settings';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // This hook gives us the current routing path
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  const getIconColor = (path: string) => {
    return location.pathname === path ? 'primary.main' : 'action.active';
  };

  return (
    <BottomNavigation
      value={location.pathname}
      onChange={handleChange}
      showLabels
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        bgcolor: 'background.paper', // Ensures the bar uses the theme's background color for paper
      }}
    >
      <BottomNavigationAction
        label="Home"
        value="/"
        icon={<HomeIcon sx={{ color: getIconColor('/') }} />}
      />
      <BottomNavigationAction
        label="Modules"
        value="/modules"
        icon={<ListAltIcon sx={{ color: getIconColor('/modules') }} />}
      />
      <BottomNavigationAction
        label="Study Planner"
        value="/study-planner"
        icon={<EventNoteIcon sx={{ color: getIconColor('/study-planner') }} />}
      />
      <BottomNavigationAction
        label="Projects"
        value="/projects"
        icon={<WorkOutlineIcon sx={{ color: getIconColor('/projects') }} />}
      />
      <BottomNavigationAction
        label="Settings"
        value="/settings"
        icon={<SettingsIcon sx={{ color: getIconColor('/settings') }} />}
      />
    </BottomNavigation>
  );
};

export default BottomNav;
