import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Container, Typography, TextField, Button, Box, Card, CardContent, Grid 
} from "@mui/material";
import { getModuleById, updateModuleDescription } from "../Utils/FirestoreService";
import DescriptionIcon from "@mui/icons-material/Description";
import CodeIcon from "@mui/icons-material/Code";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

const HARDCODED_UID = "LDkrfJqOSvV59ddYaLTUdI9lgWB2"; // Replace later with auth

const ModuleDetails = () => {
  const [searchParams] = useSearchParams();
  const moduleId: string = searchParams.get("id") || "";
  const navigate = useNavigate();

  const [moduleName, setModuleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [techStack, setTechStack] = useState<string>("");
  const [assessmentType, setAssessmentType] = useState<string>("");
  const [moduleActivities, setModuleActivities] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQuizUnlocked, setIsQuizUnlocked] = useState<boolean>(false);

  useEffect(() => {
    if (!moduleId) {
      console.error("No module ID found.");
      navigate("/modules");
      return;
    }

    const fetchModuleData = async () => {
      setIsLoading(true);
      try {
        const moduleData = await getModuleById(HARDCODED_UID, moduleId);
        if (moduleData) {
          setModuleName(moduleData.name);
          setDescription(moduleData.description || "");
          setTechStack(moduleData.techStack || "");
          setAssessmentType(moduleData.assessmentType || "");
          setModuleActivities(moduleData.moduleActivities || "");

          // ✅ Automatically unlock quiz if all fields are already filled
          setIsQuizUnlocked(
            !!(moduleData.description && moduleData.techStack && moduleData.assessmentType && moduleData.moduleActivities)
          );
        }
      } catch (error) {
        console.error("Error fetching module data:", error);
      }
      setIsLoading(false);
    };

    fetchModuleData();
  }, [moduleId, navigate]);

  const handleSave = async () => {
    if (!description.trim() || !techStack.trim() || !assessmentType.trim() || !moduleActivities.trim()) {
      alert("Please fill in all fields before saving.");
      return;
    }

    try {
      await updateModuleDescription(HARDCODED_UID, moduleId, {
        description,
        techStack,
        assessmentType,
        moduleActivities,
      });

      alert("Module details saved successfully!");

      // ✅ Ensure quiz unlocks dynamically after save
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

      <Grid container spacing={3}>
        {/* Module Description */}
        <Grid item xs={12} md={6}>
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
        </Grid>

        {/* Tech Stack */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <CodeIcon color="primary" />
                <Typography variant="h6">Tech Stack Used</Typography>
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g., React, Python, Java, SQL"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Assessment Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Assessment Type</Typography>
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g., Final Exam, Continuous Assessment, Mixed"
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* What Will You Be Doing */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <WorkOutlineIcon color="primary" />
                <Typography variant="h6">What Will You Be Doing?</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                variant="outlined"
                placeholder="e.g., Building mobile apps with Angular, writing research papers..."
                value={moduleActivities}
                onChange={(e) => setModuleActivities(e.target.value)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
