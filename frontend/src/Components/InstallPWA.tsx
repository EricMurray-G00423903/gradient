import React from 'react';
import { Button } from '@mui/material';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const InstallPWA: React.FC = () => {

    // State to show the install button
    const [showButton, setShowButton] = React.useState(true);

    React.useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          console.log('beforeinstallprompt fired');
          // Store the event for later use
          window.deferredPrompt = e;
          // Show install button
          setShowButton(true);
        });
      }, []);
    
      const handleInstallClick = async () => {
        console.log('handleInstallClick fired');
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return;
    
        // Show the prompt
        promptEvent.prompt();
    
        const result = await promptEvent.userChoice;
        console.log(result);
        if (result.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
    
        // We no longer need the prompt
        window.deferredPrompt = null;
        setShowButton(false);
      };
    
      return showButton ? (
        <Button variant="contained" color="primary" onClick={handleInstallClick}>
          Install App
        </Button>
      ) : null;
};

export default InstallPWA;