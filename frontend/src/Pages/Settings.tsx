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
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Back icon
import InstallPWA from "../Components/InstallPWA";

const Settings: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/"; // Redirect to home/login
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card sx={{ width: "400px", padding: 3, textAlign: "center", boxShadow: 3, backgroundColor: "background.paper" }}>
        <CardContent>
          {/* Back Button */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={() => navigate("/profile")} color="primary" sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" color="primary">Settings</Typography>
          </Box>

          <Divider sx={{ mb: 2, bgcolor: "primary.main" }} />

          <Typography variant="body1" sx={{ mb: 2 }}>Manage your account settings.</Typography>

          {/* PWA Install Button */}
          <InstallPWA />

          {/* Logout Button */}
          <Button variant="contained" color="error" sx={{ mt: 2, width: "100%" }} onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
