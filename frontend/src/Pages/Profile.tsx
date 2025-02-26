import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  CircularProgress,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Divider
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

const Profile = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  // Show loading indicator while fetching user data
  if (!userData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>You need to log in.</Typography>;
  }

  return (
    <Box sx={{ padding: 3, textAlign: "center", maxWidth: 600, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" color="primary">Profile</Typography>
        <IconButton onClick={() => navigate("/settings")} color="secondary">
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* User Info Section */}
      <Paper sx={{ padding: 3, borderRadius: 2, mb: 3, boxShadow: 3, backgroundColor: "background.paper" }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", mx: "auto", mb: 2 }}>
          <AccountCircleIcon sx={{ fontSize: 50 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "primary.main" }}>{userData?.name}</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>Email: {user?.email}</Typography>
        <Typography variant="body1" sx={{ mt: 1, color: "secondary.main" }}>
          <SchoolIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Course: {userData?.course || "No course selected"}
        </Typography>
      </Paper>

      <Divider sx={{ mb: 3, bgcolor: "primary.main" }} />

      {/* Modules Section */}
      <Typography variant="h6" sx={{ mb: 2 }} color="primary">Your Modules</Typography>

      {userData?.modules?.length > 0 ? (
        <Grid container spacing={2}>
          {userData.modules.map((mod: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; proficiency: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
            <Grid item xs={12} key={mod.id}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: "background.paper" }}>
                <CardContent>
                  <Typography variant="h6" color="primary">{mod.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Proficiency: {mod.proficiency}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
          No modules added yet. Start by adding your first module!
        </Typography>
      )}

      {/* Add Module Button */}
      <Button
        variant="contained"
        sx={{ mt: 3 }}
        startIcon={<AddCircleIcon />}
        onClick={() => navigate("/add-module")}
        color="primary"
      >
        Add Module
      </Button>
    </Box>
  );
};

export default Profile;
