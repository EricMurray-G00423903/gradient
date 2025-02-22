import React from "react";
import { Button } from "@mui/material";

const InstallPWA: React.FC = () => {
  const handleInstallClick = () => {
    alert(
      "📲 How to Install Gradient:\n\n" +
      "🔹 Chrome (Android & Desktop):\n   - Tap the three dots (⋮) in the top-right\n   - Select 'Install App'\n\n" +
      "🔹 Safari (iPhone & iPad):\n   - Tap the Share button (⬆️)\n   - Select 'Add to Home Screen'\n\n" +
      "🔹 Firefox & Other Browsers:\n   - Open the browser menu\n   - Look for 'Add to Home Screen' or 'Install' option\n\n" +
      "✨ Enjoy your PWA experience!"
    );
  };

  return (
    <Button variant="contained" color="primary" onClick={handleInstallClick}>
      Install
    </Button>
  );
};

export default InstallPWA;