import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Container, Typography, TextField, Button, Box, Card, CardContent, Snackbar, CircularProgress
} from "@mui/material";
import { getModuleById, updateModuleDescription } from "../Utils/FirestoreService";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

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
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [prefetchLoading, setPrefetchLoading] = useState(false);

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

  // 🚀 Handle Saving Module Details and prefetch quiz questions
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

      // Open MUI success snackbar
      setSuccessSnackbarOpen(true);

      // Begin prefetching quiz questions from OpenAI
      prefetchQuizQuestions();
    } catch (error) {
      console.error("Error updating module details:", error);
    }
  };

  // 🚀 Prefetch Quiz Questions and save them to Firestore
  const prefetchQuizQuestions = async () => {
    setPrefetchLoading(true);
    try {
      const response = await fetch(
        "https://generatequizquestions-talutcxweq-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleName,
            proficiencyScore: 0, // Assuming default proficiency here
            moduleDescription: description || "No description provided.",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch quiz questions");
      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("Invalid quiz questions received");
      }
      const moduleRef = doc(db, `users/${userId}/modules/${moduleId}`);
      // Clear old quiz questions and write new ones
      await updateDoc(moduleRef, { quizQuestions: data.questions });
    } catch (error) {
      console.error("Error prefetching quiz questions:", error);
    }
    setPrefetchLoading(false);
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

      {prefetchLoading && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <CircularProgress size={24} />
          <Typography sx={{ mt: 1 }}>
            Preparing Your Personalised Assessment...
          </Typography>
        </Box>
      )}

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

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbarOpen(false)}
        message="Module details saved successfully!"
      />
    </Container>
  );
};

export default ModuleDetails;