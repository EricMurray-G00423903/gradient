import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const InstallPWA: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleInstallClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleInstallClick} style={{ width: "100%" }}>
        Install
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>📲 How to Install Gradient</DialogTitle>
        <DialogContent>
          <DialogContentText>
            🔹 <strong>Chrome (Android & Desktop):</strong><br />
            &nbsp;&nbsp;&nbsp;- Tap the three dots (⋮) in the top-right<br />
            &nbsp;&nbsp;&nbsp;- Select 'Install App'<br /><br />
            🔹 <strong>Safari (iPhone & iPad):</strong><br />
            &nbsp;&nbsp;&nbsp;- Tap the Share button (⬆️)<br />
            &nbsp;&nbsp;&nbsp;- Select 'Add to Home Screen'<br /><br />
            🔹 <strong>Firefox & Other Browsers:</strong><br />
            &nbsp;&nbsp;&nbsp;- Open the browser menu<br />
            &nbsp;&nbsp;&nbsp;- Look for 'Add to Home Screen' or 'Install' option<br /><br />
            ✨ Enjoy your PWA experience!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallPWA;