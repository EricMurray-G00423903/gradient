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
  LinearProgress,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SchoolIcon from "@mui/icons-material/School";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const fetchUserModules = async (userId: string) => {
    setLoadingModules(true);
    try {
      // Use the subcollection path that matches other pages
      const modulesRef = collection(firestore, `users/${userId}/modules`);
      const querySnapshot = await getDocs(modulesRef);
      
      const userModules: any[] = [];
      querySnapshot.forEach((doc) => {
        userModules.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("Fetched modules:", userModules);
      setModules(userModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoadingModules(false);
    }
  };

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
          
          // Fetch user's modules
          await fetchUserModules(user.uid);
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
        <CircularProgress sx={{ color: "#5500aa" }} />
      </Box>
    );
  }

  if (!user) {
    return <Typography variant="h6" sx={{ textAlign: "center", mt: 4, color: "#5500aa" }}>You need to log in.</Typography>;
  }

  return (
    <Box sx={{ padding: 3, textAlign: "center", maxWidth: 700, mx: "auto" }}>
      {/* Header with Settings Icon */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" color="#5500aa" fontWeight="bold">Profile</Typography>
        <IconButton onClick={() => navigate("/settings")} sx={{ color: "#5500aa" }}>
          <SettingsIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>

      {/* User Info Section */}
      <Paper sx={{ 
        padding: 3, 
        borderRadius: 2, 
        mb: 3, 
        boxShadow: '0 4px 20px rgba(85, 0, 170, 0.1)', 
        backgroundColor: "#ffffff" 
      }}>
        <Avatar sx={{ 
          width: 80, 
          height: 80, 
          bgcolor: "#5500aa", 
          mx: "auto", 
          mb: 2,
          boxShadow: '0 4px 8px rgba(85, 0, 170, 0.2)'
        }}>
          <AccountCircleIcon sx={{ fontSize: 50 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#5500aa" }}>
          {userData?.name || "No Name Set"}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Email: {user?.email}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, color: "#ddaaff" }}>
          <SchoolIcon sx={{ verticalAlign: "middle", mr: 1, color: "#5500aa" }} />
          Course: {userData?.course || "No course selected"}
        </Typography>
      </Paper>

      <Divider sx={{ mb: 3, bgcolor: "#ddaaff" }} />

      {/* Modules Section */}
      <Typography variant="h6" sx={{ mb: 2 }} color="#5500aa" fontWeight="bold">Your Modules</Typography>

      {loadingModules ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: "#f0e6ff",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#5500aa",
            },
          }} />
        </Box>
      ) : modules.length > 0 ? (
        <Grid container spacing={2}>
          {modules.map((mod) => (
            <Grid item xs={12} key={mod.id}>
              <Card 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 4px 12px rgba(85, 0, 170, 0.1)', 
                  backgroundColor: "#ffffff",
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { 
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 16px rgba(85, 0, 170, 0.15)'
                  }
                }}
                onClick={() => navigate(`/module-details?id=${mod.id}`)}
              >
                <CardContent>
                  <Typography variant="h6" color="#5500aa">{mod.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Quizzed: {mod.lastTested ? new Date(mod.lastTested.toDate()).toLocaleDateString() : 'Never'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mod.description ? "Has description" : "No description"}
                    </Typography>
                  </Box>
                  {mod.proficiency !== undefined && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Proficiency: {mod.proficiency}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={mod.proficiency || 0} 
                        sx={{ 
                          mt: 0.5, 
                          height: 8, 
                          borderRadius: 2,
                          bgcolor: "#f0e6ff",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#5500aa",
                          },
                        }}
                      />
                    </Box>
                  )}
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
        sx={{ 
          mt: 3, 
          px: 4, 
          py: 1.5,
          bgcolor: "#5500aa",
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(85, 0, 170, 0.2)',
          '&:hover': {
            bgcolor: '#7722cc',
            boxShadow: '0 6px 16px rgba(85, 0, 170, 0.3)',
          }
        }}
        startIcon={<AddCircleIcon />}
        onClick={() => navigate("/Modules")}
      >
        Add Module
      </Button>

      {/* Modal for Name & Course Entry */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "450px",
            background: "#ffffff",
            padding: "2.5rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: '0 16px 32px rgba(85, 0, 170, 0.15)',
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="#5500aa" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography sx={{ mb: 3, fontSize: "1.2rem", color: "#666" }}>
            Please enter your full name and course to continue.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
            <Typography variant="h6" color="#5500aa">Full Name</Typography>
            <TextField
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                borderRadius: "8px",
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#5500aa',
                  },
                },
              }}
            />
            
            <Typography variant="h6" color="#5500aa">Course Name</Typography>
            <TextField
              variant="outlined"
              fullWidth
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              sx={{
                borderRadius: "8px",
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#5500aa',
                  },
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            sx={{ 
              fontSize: "1.2rem", 
              padding: "0.9rem", 
              mt: 3, 
              bgcolor: "#5500aa",
              borderRadius: '12px',
              width: '100%',
              '&:hover': {
                bgcolor: '#7722cc',
              }
            }}
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