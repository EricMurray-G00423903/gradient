import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Container, Typography, TextField, Button, Box, Card, CardContent, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { getModuleById, updateModuleDescription } from "../Utils/FirestoreService";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc, Timestamp, deleteDoc } from "firebase/firestore";
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
  const [hasBeenTested, setHasBeenTested] = useState<boolean>(false);
  const [studyTasks, setStudyTasks] = useState<any[]>([]);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [quizAssessmentSnackbarOpen, setQuizAssessmentSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

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

  // Remove polling related code and use a single fetch effect
  useEffect(() => {
    if (!moduleId || !userId) return;
    const fetchModuleData = async () => {
      try {
        const moduleData = await getModuleById(userId, moduleId);
        if (moduleData) {
          setModuleName(moduleData.name);
          setDescription(moduleData.description || "");
          setIsQuizUnlocked(!!moduleData.description);
          setHasBeenTested(moduleData.hasBeenTested ?? false);
          setStudyTasks(moduleData.studyPlan?.studyTasks || []);
        }
      } catch (error) {
        console.error("Error fetching module data:", error);
      } finally {
        setIsLoading(false);
      }
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

      // Show details saved snackbar immediately
      setSuccessSnackbarOpen(true);

      // Prefetch quiz questions
      prefetchQuizQuestions();
    } catch (error) {
      console.error("Error updating module details:", error);
    }
  };

  // 🚀 Prefetch Quiz Questions and save them to Firestore
  const prefetchQuizQuestions = async () => {
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
      // Show Assessment Ready snackbar and update state so quiz button appears
      setQuizAssessmentSnackbarOpen(true);
      setHasBeenTested(true);
    } catch (error) {
      console.error("Error prefetching quiz questions:", error);
    }
  };

  // Function to open the delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setDeleteConfirmInput("");
  };

  // Function to close the dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmInput("");
  };

  // Function to handle the actual deletion if module name is confirmed
  const handleConfirmDelete = async () => {
    if (deleteConfirmInput !== moduleName) {
      // Optionally, you can provide user feedback here about a mismatch.
      return;
    }
    try {
      if (!userId) throw new Error("User not authenticated.");
      await deleteDoc(doc(db, `users/${userId}/modules/${moduleId}`));
      // Navigate back to modules after deletion.
      navigate("/modules");
    } catch (error) {
      console.error("Error deleting module:", error);
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
        
        {/* New Delete Button */}
        <Button 
                  variant="contained" 
                  color="error" 
                  onClick={handleOpenDeleteDialog}
                >
                  Delete Module
                </Button>
      </Box>

      {/* Updated quiz button logic */}
      {description && !hasBeenTested && (
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
      {description && hasBeenTested && studyTasks.length > 0 && 
       studyTasks.every((task: any) => task.completed) && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            startIcon={<QuizIcon />} 
            onClick={() => navigate(`/quiz?id=${moduleId}`)}
          >
            Retake Quiz
          </Button>
        </Box>
      )}

      {/* Snackbars for quiz assessment & module details saved */}
      <Snackbar
        open={quizAssessmentSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setQuizAssessmentSnackbarOpen(false)}
        message="Assessment Ready!"
      />
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbarOpen(false)}
        message="Module details saved successfully! Generating Assessment..."
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Module Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            To confirm deletion, please type the module name: <strong>{moduleName}</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Module Name"
            fullWidth
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            disabled={deleteConfirmInput !== moduleName}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModuleDetails;