import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IconButton, CircularProgress, Box, Typography, Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

const Profile = () => {
  const { user, userData } = useAuth(); // ✅ Now uses AuthContext
  const navigate = useNavigate();

  if (!user) {
    return <Typography variant="h6">You need to log in.</Typography>;
  }

  return (
    <Box sx={{ padding: 3, textAlign: "center" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">Profile</Typography>
        <IconButton onClick={() => navigate("/settings")}>
          <SettingsIcon />
        </IconButton>
      </header>

      <Typography variant="h5" sx={{ mt: 2 }}>{userData?.name}</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>Email: {user?.email}</Typography>
      <Typography variant="body1">Course: {userData?.course || "No course selected"}</Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>Your Modules</Typography>
      {userData?.modules?.length > 0 ? (
        <ul>
          {userData.modules.map((mod: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; proficiency: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
            <li key={mod.id}>{mod.name} - Proficiency: {mod.proficiency}%</li>
          ))}
        </ul>
      ) : (
        <Typography>No modules added yet.</Typography>
      )}

      <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/add-module")}>
        Add Module
      </Button>
    </Box>
  );
};

export default Profile;
