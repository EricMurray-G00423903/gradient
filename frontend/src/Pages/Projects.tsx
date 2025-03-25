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
  MenuItem, Select, FormControl, InputLabel,
  Link,
  TextField,
  LinearProgress
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
  const [todoList, setTodoList] = useState<{ text: string; completed: boolean }[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);
  const [githubLink, setGithubLink] = useState<string>('');
  const [tempGithubLink, setTempGithubLink] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<number>(0);

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
  };

  const generateProject = async () => {
    if (!selectedModule) {
      console.error("No module selected.");
      return;
    }
  
    const projectRef = doc(db, `users/${userId}/projects/${selectedModule.id}`);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      // Load existing project data
      const data = projectSnap.data();
      setProjectDescription(data.description);
      setTechStack(data.techStack || []);
      setTodoList((data.todoList || []).map((task: any) => typeof task === 'string' ? { text: task, completed: false } : task));
      setCompletedTasks((data.todoList || []).filter((task: { completed: any; }) => task.completed).length);
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
      setCompletedTasks(0);
        
      // ✅ Save to Firestore
      await setDoc(projectRef, {
        description: data.description,
        techStack: data.techStack || [],
        todoList: data.todoList || [],
        createdAt: Date.now(),
      });
  
    } catch (error) {
      console.error("Error generating project:", error);
    }
  
    setGenerating(false);
  };

  const handleCheckboxChange = (index: number) => {
    const newTodoList = [...todoList];
    newTodoList[index].completed = !newTodoList[index].completed;
    setTodoList(newTodoList);
    setCompletedTasks(newTodoList.filter(task => task.completed).length);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: "#5500aa" }}>
          {selectedModule.name} - Project Idea
        </Typography>
        {todoList.length > 0 && (
          <Box sx={{ width: '200px' }}>
            <LinearProgress
              variant="determinate"
              value={(completedTasks / todoList.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {completedTasks} of {todoList.length} tasks completed
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        Proficiency Level: {selectedModule.proficiency || 0}%
      </Typography>
      
      {!projectDescription && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={generateProject}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Project"}
        </Button>
      )}

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
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleCheckboxChange(index)}
                />
                <ListItemText primary={task.text} />
              </ListItem>
            ))}
          </List>
          <LinearProgress
            variant="determinate"
            value={(completedTasks / todoList.length) * 100}
            sx={{ mt: 2 }}
          />
        </Box>
      )}

      {/* 🔗 GitHub Link */}
      <Box
        sx={{
          backgroundColor: "#f3e5f5",
          borderRadius: "12px",
          p: 2,
          mt: 3
        }}
      >
        <Typography variant="h6" sx={{ color: "#8e24aa" }}>🔗 GitHub Repository</Typography>
        {githubLink ? (
          <Link href={githubLink} target="_blank" rel="noopener">
            {githubLink}
          </Link>
        ) : (
          <TextField
            fullWidth
            variant="outlined"
            label="Paste your GitHub repo link"
            value={tempGithubLink}
            onChange={(e) => setTempGithubLink(e.target.value)}
            onBlur={() => {
              setGithubLink(tempGithubLink);
            }}
            sx={{ mt: 1 }}
          />
        )}
      </Box>
    </CardContent>
  </Card>
)}
  </Container>
  );
};

export default Projects;