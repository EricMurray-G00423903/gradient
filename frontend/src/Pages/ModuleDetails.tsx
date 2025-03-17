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

  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <CircularProgress sx={{ color: "#5500aa" }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" color="#5500aa" align="center" fontWeight="bold" gutterBottom>
        {moduleName}
      </Typography>

      <Card sx={{
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(85, 0, 170, 0.1)',
        backgroundColor: "#ffffff",
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon sx={{ color: "#5500aa" }} />
            <Typography variant="h6" sx={{ color: "#5500aa" }}>Module Description</Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            variant="outlined"
            placeholder="Provide a detailed module description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#5500aa',
                },
              },
            }}
            minRows={4}
          />
        </CardContent>
      </Card>

      {/* Buttons with Icons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: '#4caf50', 
            '&:hover': { bgcolor: '#388e3c' },
            borderRadius: '8px',
          }} 
          startIcon={<CheckCircleIcon />} 
          onClick={handleSave}
        >
          Save
        </Button>
        
        <Button 
          variant="outlined" 
          sx={{ 
            color: '#f44336',
            borderColor: '#f44336',
            '&:hover': { 
              borderColor: '#d32f2f',
              backgroundColor: 'rgba(244,67,54,0.04)'
            },
            borderRadius: '8px',
          }}
          startIcon={<DoNotDisturbIcon />} 
          onClick={() => navigate("/modules")}
        >
          Cancel
        </Button>
        
        {/* Delete Button */}
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: '#f44336', 
            '&:hover': { bgcolor: '#d32f2f' },
            borderRadius: '8px',
          }}
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
            sx={{ 
              borderRadius: '8px',
              padding: '12px 24px',
              bgcolor: "#5500aa",
              '&:hover': { bgcolor: "#7722cc" },
            }}
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
            sx={{ 
              borderRadius: '8px',
              padding: '12px 24px',
              bgcolor: "#5500aa",
              '&:hover': { bgcolor: "#7722cc" },
            }}
          >
            Retake Quiz
          </Button>
        </Box>
      )}
      {/* New condition: Show message when user has been tested but has incomplete study tasks */}
      {description && hasBeenTested && studyTasks.length > 0 && 
       !studyTasks.every((task: any) => task.completed) && (
        <Box sx={{ 
          mt: 4, 
          textAlign: "center", 
          p: 2, 
          border: '1px dashed #ddaaff', 
          borderRadius: 2,
          backgroundColor: '#f8f5ff'
        }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Complete all your study tasks before retaking the quiz
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ 
              mt: 1,
              color: "#5500aa",
              borderColor: "#5500aa",
              '&:hover': { 
                borderColor: "#7722cc",
                backgroundColor: 'rgba(85,0,170,0.04)'
              },
              borderRadius: '8px',
            }} 
            size="medium" 
            onClick={() => navigate(`/study-planner?id=${moduleId}`)}
          >
            Go to Study Planner
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
        <DialogTitle sx={{ color: "#5500aa" }}>Confirm Module Deletion</DialogTitle>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#5500aa',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            disabled={deleteConfirmInput !== moduleName}
            sx={{
              color: "#f44336"
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModuleDetails;