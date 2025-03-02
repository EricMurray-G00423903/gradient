import { useState, useEffect } from "react";
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
  Divider,
  Modal,
  TextField,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setName(data.name || "");
          setCourse(data.course || "");

          // 🔹 Always show modal if name or course is missing
          if (!data.name || !data.course) {
            setIsModalOpen(true);
          }
        } else {
          // 🔹 If user is new (no Firestore entry), create a profile and ask for details
          await setDoc(userRef, {
            name: user.displayName || "",
            email: user.email,
            course: "",
          });
          setIsModalOpen(true);
        }
        setLoading(false);
      };
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      await setDoc(userRef, { name, course }, { merge: true });
      setIsModalOpen(false);
      setUserData((prev: any) => ({ ...prev, name, course })); // Update state to reflect changes
    }
  };

  if (loading) {
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
    <Box sx={{ padding: 3, textAlign: "center", maxWidth: 700, mx: "auto" }}>
      {/* Header with Settings Icon */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" color="primary">Profile</Typography>
        <IconButton onClick={() => navigate("/settings")} color="secondary">
          <SettingsIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>

      {/* User Info Section */}
      <Paper sx={{ padding: 3, borderRadius: 2, mb: 3, boxShadow: 3, backgroundColor: "#1e1e1e" }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", mx: "auto", mb: 2 }}>
          <AccountCircleIcon sx={{ fontSize: 50 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "primary.main" }}>{userData?.name || "No Name Set"}</Typography>
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
          {userData.modules.map((mod: { id: string; name: string; proficiency: number }) => (
            <Grid item xs={12} key={mod.id}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: "#1e1e1e" }}>
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
        sx={{ mt: 3, px: 4, py: 1.5 }}
        startIcon={<AddCircleIcon />}
        onClick={() => navigate("/Modules")}
        color="primary"
      >
        Add Module
      </Button>

      {/* 🔹 Modal for Name & Course Entry */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "450px",
          background: "#1e1e1e",
          padding: "2.5rem",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography sx={{ mb: 3, fontSize: "1.2rem", color: "#bbb" }}>
          Please enter your full name and course to continue.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
          <Typography variant="h6" color="white">Full Name</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              background: "white",
              borderRadius: "8px",
              input: { color: "black", fontSize: "1rem" },
            }}
          />
          
          <Typography variant="h6" color="white">Course Name</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            sx={{
              background: "white",
              borderRadius: "8px",
              input: { color: "black", fontSize: "1rem" },
            }}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ fontSize: "1.2rem", padding: "0.9rem", mt: 3 }}
          onClick={handleSave}
        >
          Save & Continue
        </Button>
      </Box>
    </Modal>

    </Box>
  );
};

export default Profile;