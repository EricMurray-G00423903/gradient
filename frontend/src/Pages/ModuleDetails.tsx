import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { getModuleById, updateModuleDescription } from "../Utils/FirestoreService";

const HARDCODED_UID = "LDkrfJqOSvV59ddYaLTUdI9lgWB2"; // Replace later with auth

const ModuleDetails = () => {
  const [searchParams] = useSearchParams();
  const moduleId: string = searchParams.get("id") || ""; // ✅ Ensures moduleId is always a string
  const navigate = useNavigate();

  const [moduleName, setModuleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [techStack, setTechStack] = useState<string>("");
  const [assessmentType, setAssessmentType] = useState<string>("");
  const [moduleActivities, setModuleActivities] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!moduleId) {
      console.error("No module ID found.");
      navigate("/modules"); // Redirect back if no module ID
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
      navigate("/modules"); // Redirect back to modules
    } catch (error) {
      console.error("Error updating module details:", error);
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        {moduleName}
      </Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>Module Description</Typography>
      <TextField
        fullWidth
        multiline
        variant="outlined"
        placeholder="Provide a detailed module description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mt: 1 }}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>Tech Stack Used</Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="e.g., React, Python, Java, SQL"
        value={techStack}
        onChange={(e) => setTechStack(e.target.value)}
        sx={{ mt: 1 }}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>Assessment Type</Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="e.g., Final Exam, Continuous Assessment, Mixed"
        value={assessmentType}
        onChange={(e) => setAssessmentType(e.target.value)}
        sx={{ mt: 1 }}
      />

      <Typography variant="h6" sx={{ mt: 2 }}>What Will You Be Doing?</Typography>
      <TextField
        fullWidth
        multiline
        variant="outlined"
        placeholder="e.g., Building mobile apps with Angular, writing research papers..."
        value={moduleActivities}
        onChange={(e) => setModuleActivities(e.target.value)}
        sx={{ mt: 1 }}
      />

      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant="contained" color="success" onClick={handleSave}>Save Module Details</Button>
        <Button variant="outlined" color="error" onClick={() => navigate("/modules")}>Cancel</Button>
      </Box>
    </Container>
  );
};

export default ModuleDetails;
