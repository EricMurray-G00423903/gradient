import React from 'react';
import { Box } from '@mui/material';
import InstallPWA from '../Components/InstallPWA';

const Settings: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',}}>
            <div>
                <h1>Settings Page</h1>
                <p>Welcome to the settings page.</p>
                <InstallPWA />
            </div>
        </Box>
    );
};

export default Settings;