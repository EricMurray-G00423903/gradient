import React, { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
  Box,
  Chip,
  Checkbox,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Projects = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [projectDescription, setProjectDescription] = useState<string | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [todoList, setTodoList] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchModules(user.uid);
      } else {
        setUserId(null);
        setModules([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchModules = async (uid: string) => {
    setLoading(true);
    try {
      const modulesRef = collection(db, `users/${uid}/modules`);
      const querySnapshot = await getDocs(modulesRef);

      if (!querySnapshot.empty) {
        const modulesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setModules(modulesData);
      } else {
        console.warn("No modules found.");
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
    setLoading(false);
  };

  const toggleExpand = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const selectModule = (module: any) => {
    setSelectedModule(module);
    setExpandedModule(null); // Close module list
    setProjectDescription(null);
    setTechStack([]);
    setTodoList([]);
    setInstructions("");
  };

  const generateProject = async () => {
    if (!selectedModule) {
      console.error("No module selected.");
      return;
    }
  
    const projectRef = doc(db, `users/${userId}/projects/${selectedModule.id}`);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      alert("You already have a project in progress for this module.");
      setProjectDescription(projectSnap.data().description); 
      setTechStack(projectSnap.data().techStack || []);
      setTodoList(projectSnap.data().todoList || []);
      setInstructions(projectSnap.data().instructions || "");
      return;
    }
  
    setGenerating(true);
  
    const requestBody = {
      moduleName: selectedModule.name,
      proficiencyLevel: selectedModule.proficiency || 0,
    };
  
    try {
      const response = await fetch(
        "https://us-central1-gradient-3b33e.cloudfunctions.net/generateProject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate project");
      }
  
      // ✅ Set frontend state
      setProjectDescription(data.description);
      setTechStack(data.techStack || []);
      setTodoList(data.todoList || []);
      setInstructions(data.instructions || "");

      console.log("Frontend state set:");
      console.log("Description:", data.description);
      console.log("Tech Stack:", data.techStack);
      console.log("To-Do:", data.todoList);
      console.log("Instructions:", data.instructions);
        
      // ✅ Save to Firestore
      await setDoc(projectRef, {
        description: data.description,
        techStack: data.techStack || [],
        todoList: data.todoList || [],
        instructions: data.instructions || "",
        createdAt: Date.now(),
      });
  
    } catch (error) {
      console.error("Error generating project:", error);
    }
  
    setGenerating(false);
  };
  



  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 2, color: "#5500aa", fontWeight: "bold" }}>🚀 Projects</Typography>

      {loading ? (
        <CircularProgress sx={{ color: "#5500aa" }} />
      ) : (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel id="module-select-label">Select Module</InputLabel>
      <Select
        labelId="module-select-label"
        value={selectedModule?.id || ""}
        onChange={(e) => {
          const module = modules.find((m) => m.id === e.target.value);
          if (module) selectModule(module);
        }}
      >
        {modules.map((module) => (
          <MenuItem key={module.id} value={module.id}>
            {module.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
      )}

      {/* Selected Module & Generate Project Button */}
      {selectedModule && (
        <Card sx={{ 
          mt: 4, 
          backgroundColor: "#f8f5ff", 
          borderRadius: "12px",
          boxShadow: '0 4px 12px rgba(85, 0, 170, 0.1)',
        }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: "#5500aa" }}>
              {selectedModule.name} - Project Idea
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
              Proficiency Level: {selectedModule.proficiency || 0}%
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={generateProject}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Project"}
            </Button>

            {generating && <CircularProgress sx={{ mt: 2, color: "#5500aa" }} />}
          </CardContent>
        </Card>
      )}

      {/* AI-Generated Project Description */}
      {projectDescription && (
  <Card
    sx={{
      mt: 4,
      backgroundColor: "#fafaff",
      borderRadius: "16px",
      p: 3,
      boxShadow: "0 8px 20px rgba(85, 0, 170, 0.1)"
    }}
  >
    <CardContent>

      {/* 💡 Project Idea */}
      <Box
        sx={{
          backgroundColor: "#fffde7",
          borderRadius: "12px",
          p: 2,
          mb: 3,
          boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)"
        }}
      >
        <Typography variant="h6" sx={{ color: "#f9a825" }}>💡 Project Idea</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>{projectDescription}</Typography>
      </Box>

      {/* 🧰 Tech Stack */}
      {techStack.length > 0 && (
        <Box
          sx={{
            backgroundColor: "#e3f2fd",
            borderLeft: "6px solid #2196f3",
            borderRadius: "12px",
            p: 2,
            mb: 3
          }}
        >
          <Typography variant="h6" sx={{ color: "#2196f3" }}>🧰 Tech Stack</Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {techStack.map((tech, index) => (
              <Chip key={index} label={tech} color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {/* 📋 To-Do List */}
      {todoList.length > 0 && (
        <Box
          sx={{
            backgroundColor: "#fff8e1",
            border: "2px dashed #ffb300",
            borderRadius: "12px",
            p: 2,
            mb: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffb300" }}>📋 To-Do List</Typography>
          <List>
            {todoList.map((task, index) => (
              <ListItem key={index} disablePadding>
                <Checkbox />
                <ListItemText primary={task} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* 📘 Instructions */}
      {instructions && (
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            p: 2,
            fontFamily: "monospace"
          }}
        >
          <Typography variant="h6" sx={{ color: "#424242" }}>📘 Instructions</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{instructions}</Typography>
        </Box>
      )}

    </CardContent>
  </Card>
)}


  </Container>
  );
};

export default Projects;
