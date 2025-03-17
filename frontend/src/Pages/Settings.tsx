import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CachedIcon from "@mui/icons-material/Cached";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import WarningIcon from "@mui/icons-material/Warning";
import InstallPWA from "../Components/InstallPWA";

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Function to clear cache
  const clearCache = async () => {
    try {
      // Clear caches using Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      setSnackbarMessage("Cache cleared successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      setSnackbarMessage("Failed to clear cache");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
      setSnackbarMessage("Logout failed");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const openClearCacheConfirmation = () => {
    setConfirmDialogOpen(true);
  };

  const handleClearCacheConfirmed = async () => {
    setConfirmDialogOpen(false);
    await clearCache();
    // Log the user out and redirect to home
    await logout();
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card sx={{ 
        width: "400px", 
        padding: 3, 
        textAlign: "center", 
        boxShadow: '0 8px 24px rgba(85, 0, 170, 0.15)', 
        borderRadius: '12px',
        backgroundColor: "#ffffff" 
      }}>
        <CardContent>
          {/* Back Button */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={() => navigate("/profile")} sx={{ color: "#5500aa" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" color="#5500aa" fontWeight="bold">Settings</Typography>
          </Box>

          <Divider sx={{ mb: 2, bgcolor: "#ddaaff" }} />

          <Typography variant="body1" sx={{ mb: 2, color: "#666" }}>Manage your account settings.</Typography>

          {/* Cache Management Section */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#f8f5ff', 
            border: '1px solid #ddaaff',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#5500aa" }}>Cache Management</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              If you're experiencing issues with outdated content, clearing the cache may help.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<CachedIcon />}
              onClick={openClearCacheConfirmation} 
              sx={{ 
                width: "100%",
                color: "#5500aa",
                borderColor: "#5500aa",
                '&:hover': { 
                  borderColor: "#7722cc",
                  backgroundColor: 'rgba(85,0,170,0.04)'
                },
                borderRadius: '8px',
                mb: 2,
              }}
            >
              Clear Cache & Reload
            </Button>
          </Box>

          {/* PWA Install Section */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: '8px', 
            backgroundColor: '#f8f5ff', 
            border: '1px solid #ddaaff',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#5500aa" }}>Install App</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              Install Gradient on your device for a better experience and offline access.
            </Typography>
            <InstallPWA />
          </Box>

          {/* Logout Button */}
          <Button 
            variant="contained" 
            startIcon={<ExitToAppIcon />}
            sx={{ 
              mt: 2, 
              width: "100%", 
              bgcolor: "#f44336",
              '&:hover': { bgcolor: "#d32f2f" },
              borderRadius: '8px',
              py: 1.2,
            }} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog for Cache Clearing */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: "#f57c00" }} />
          <Typography color="#5500aa" fontWeight="bold">Warning: This Will Log You Out</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Clearing the cache will remove all stored data and log you out of the application. You will need to log in again after this action.
            <br /><br />
            Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ color: "#666" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClearCacheConfirmed}
            variant="contained"
            sx={{ 
              bgcolor: "#f57c00",
              '&:hover': { bgcolor: "#e65100" },
              color: "white"
            }}
          >
            Clear Cache & Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
