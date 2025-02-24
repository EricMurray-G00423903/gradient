import React from "react";
import { useAuth } from "../Context/AuthContext";
import { Box, Button, Card, CardContent, Typography, Divider } from "@mui/material";
import InstallPWA from "../Components/InstallPWA";

const Settings: React.FC = () => {
  const { logout } = useAuth();

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
      <Card sx={{ width: "400px", padding: 3, textAlign: "center", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Settings</Typography>
          <Divider sx={{ mb: 2 }} />

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
