import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Container, Typography, TextField, Button, Box, Card, CardContent
} from "@mui/material";
import { getModuleById, updateModuleDescription } from "../Utils/FirestoreService";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ModuleDetails = () => {
  const [searchParams] = useSearchParams();
  const moduleId: string = searchParams.get("id") || "";
  const navigate = useNavigate();

  // 🔥 Dynamic User State
  const [userId, setUserId] = useState<string | null>(null);

  // Module Details State
  const [moduleName, setModuleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQuizUnlocked, setIsQuizUnlocked] = useState<boolean>(false);

  // 🚀 Get User ID Dynamically on Mount
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login"); // 🔄 Redirect if user is not authenticated
      }
    });
  }, [navigate]);

  // 🚀 Fetch Module Data When `userId` & `moduleId` are Set
  useEffect(() => {
    if (!moduleId || !userId) return;

    const fetchModuleData = async () => {
      setIsLoading(true);
      try {
        const moduleData = await getModuleById(userId, moduleId);
        if (moduleData) {
          setModuleName(moduleData.name);
          setDescription(moduleData.description || "");

          // ✅ Unlock quiz if all fields are filled
          setIsQuizUnlocked(
            !!(moduleData.description)
          );
        }
      } catch (error) {
        console.error("Error fetching module data:", error);
      }
      setIsLoading(false);
    };

    fetchModuleData();
  }, [moduleId, userId]);

  // 🚀 Handle Saving Module Details
  const handleSave = async () => {
    if (!description.trim()) {
      alert("Please fill in all fields before saving.");
      return;
    }

    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    try {
      await updateModuleDescription(userId, moduleId, {
        description,
      });

      alert("Module details saved successfully!");
      setIsQuizUnlocked(true);
    } catch (error) {
      console.error("Error updating module details:", error);
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        {moduleName}
      </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon color="primary" />
            <Typography variant="h6">Module Description</Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            variant="outlined"
            placeholder="Provide a detailed module description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      {/* Buttons with Icons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<CheckCircleIcon />} 
          onClick={handleSave}
        >
          Save
        </Button>
        
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DoNotDisturbIcon />} 
          onClick={() => navigate("/modules")}
        >
          Cancel
        </Button>
      </Box>

      {/* Take Quiz Button (Appears if all details are filled) */}
      {isQuizUnlocked && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            startIcon={<QuizIcon />} 
            onClick={() => navigate(`/quiz?id=${moduleId}`)}
          >
            Take Proficiency Quiz
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ModuleDetails;