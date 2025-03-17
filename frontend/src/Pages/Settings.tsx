import React from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InstallPWA from "../Components/InstallPWA";

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
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
    </Box>
  );
};

export default Settings;
