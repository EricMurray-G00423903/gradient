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
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  


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

  const isProjectReadyToComplete = () => {
    const allTasksDone = todoList.length > 0 && todoList.every(task => task.completed);
    const hasGithubLink = !!githubLink.trim();
    return allTasksDone && hasGithubLink;
  };
  
  

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
  const selectModule = async (module: any) => {
    setSelectedModule(module);
    setExpandedModule(null);
    setProjectDescription(null);
    setTechStack([]);
    setTodoList([]);
    setGenerating(false);
  
    if (!userId) return;
  
    const projectRef = doc(db, `users/${userId}/projects/${module.id}`);
    const projectSnap = await getDoc(projectRef);
  
    if (projectSnap.exists()) {
      const data = projectSnap.data();
      setProjectDescription(data.description);
      setTechStack(data.techStack || []);
      const list = (data.todoList || []).map((task: any) =>
        typeof task === 'string' ? { text: task, completed: false } : task
      );
      setTodoList(list);
      setCompletedTasks(list.filter((task: { completed: any; }) => task.completed).length);
    }
  };
  

  const generateProject = async () => {
    if (!selectedModule) {
      console.error("No module selected.");
      return;
    }
  
    const projectRef = doc(db, `users/${userId}/projects/${selectedModule.id}`);
    const projectSnap = await getDoc(projectRef);
    
  
  
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
      setTodoList(
        (data.todoList || []).map((item: string) => ({
          text: item,
          completed: false
        }))
      );
      
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


  const handleProjectComplete = async () => {
    if (!userId || !selectedModule) return;
  
    const completedProject = {
      moduleId: selectedModule.id,
      moduleName: selectedModule.name,
      description: projectDescription,
      githubLink,
      techStack,
      todoList,
      dateCompleted: new Date().toISOString(),
    };
  
    const completedRef = doc(db, `users/${userId}/completedProjects/${selectedModule.id}`);
    const projectRef = doc(db, `users/${userId}/projects/${selectedModule.id}`);
  
    await setDoc(completedRef, completedProject);
    await setDoc(projectRef, {}); // or deleteDoc(projectRef)
  
    // Reset UI
    setShowConfirmComplete(false);
    setShowCompletionPopup(true);
    setSelectedModule(null);
    setProjectDescription(null);
    setTechStack([]);
    setTodoList([]);
    setCompletedTasks(0);
    setTempGithubLink('');
    setGithubLink('');
  };
  


  return (
    <Container maxWidth="md">
      <Typography 
        variant="h4" 
        sx={{ 
          mt: 4, 
          mb: 2, 
          background: 'linear-gradient(45deg, #5500aa, #7733bb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          textAlign: "center"
        }}
      >
        🚀 Projects
      </Typography>
  
      {loading ? (
        <CircularProgress sx={{ color: "#5500aa" }} />
      ) : (
        <FormControl 
          fullWidth 
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#ddaaff' },
              '&:hover fieldset': { borderColor: '#5500aa' },
              '&.Mui-focused fieldset': { borderColor: '#5500aa' }
            }
          }}
        >
          <InputLabel id="module-select-label" sx={{ color: '#5500aa' }}>Select Module</InputLabel>
          <Select
            labelId="module-select-label"
            value={selectedModule?.id || ""}
            onChange={(e) => {
              const module = modules.find((m) => m.id === e.target.value);
              if (module) selectModule(module);
            }}
          >
            {modules.map((module) => (
              <MenuItem 
                key={module.id} 
                value={module.id}
                sx={{
                  '&:hover': { backgroundColor: '#f8f5ff' },
                  '&.Mui-selected': {
                    backgroundColor: '#f0e6ff',
                    '&:hover': { backgroundColor: '#e6d0ff' }
                  }
                }}
              >
                {module.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
  
      {selectedModule && (
        <Card sx={{ 
          mt: 4, 
          background: 'linear-gradient(135deg, #f8f5ff 0%, #ffffff 100%)',
          borderRadius: "16px",
          boxShadow: '0 8px 32px rgba(85, 0, 170, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(85, 0, 170, 0.12)',
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ 
                color: "#5500aa",
                fontWeight: 700
              }}>
                {selectedModule.name} - Project Idea
              </Typography>
              {todoList.length > 0 && (
                <Box sx={{ width: '200px' }}>
                  <LinearProgress
                    variant="determinate"
                    value={(completedTasks / todoList.length) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f0e6ff',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#5500aa'
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right', mt: 0.5 }}>
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
                sx={{ 
                  mt: 2,
                  background: 'linear-gradient(45deg, #5500aa, #7733bb)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4a0099, #662aa6)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(85, 0, 170, 0.2)'
                  }
                }}
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
  
      {projectDescription && (
        <Card
          sx={{
            mt: 4,
            background: '#ffffff',
            borderRadius: "16px",
            p: 3,
            boxShadow: "0 8px 32px rgba(85, 0, 170, 0.08)"
          }}
        >
          <CardContent>
            <Box
              sx={{
                backgroundColor: "#e8f5e9",
                borderRadius: "12px",
                p: 3,
                mb: 3,
                border: '1px solid #a5d6a7',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
              >
              <Typography variant="h6" sx={{ color: "#5500aa", fontWeight: 700, mb: 2 }}>
                💡 Project Idea
              </Typography>
              <Typography variant="body1">{projectDescription}</Typography>
            </Box>
  
            {techStack.length > 0 && (
              <Box
                sx={{
                  backgroundColor: "#e3f2fd",
                  borderRadius: "12px",
                  p: 3,
                  mb: 3,
                  border: '1px solid #90caf9',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ color: "#5500aa", fontWeight: 700, mb: 2 }}>
                  🧰 Tech Stack
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {techStack.map((tech, index) => (
                    <Chip 
                      key={index} 
                      label={tech} 
                      sx={{
                        background: 'linear-gradient(135deg, #f0e6ff 0%, #e6d0ff 100%)',
                        color: '#5500aa',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 2px 8px rgba(85, 0, 170, 0.15)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
  
            {todoList.length > 0 && (
              <Box
                sx={{
                  backgroundColor: "#fff8e1",
                  borderRadius: "12px",
                  p: 3,
                  mb: 3,
                  border: '1px solid #ffe082',
                }}
              >
                <Typography variant="h6" sx={{ color: "#5500aa", fontWeight: 700, mb: 2 }}>
                  📋 To-Do List
                </Typography>
                <List>
                  {todoList.map((task, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding
                      sx={{
                        mb: 1,
                        borderRadius: '8px',
                        backgroundColor: task.completed ? '#f0e6ff' : '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          backgroundColor: task.completed ? '#e6d0ff' : '#f8f5ff'
                        }
                      }}
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleCheckboxChange(index)}
                        sx={{
                          color: '#ddaaff',
                          '&.Mui-checked': {
                            color: '#5500aa'
                          }
                        }}
                      />
                      <ListItemText 
                        primary={task.text}
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <LinearProgress
                  variant="determinate"
                  value={(completedTasks / todoList.length) * 100}
                  sx={{ 
                    mt: 2,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f0e6ff',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#5500aa'
                    }
                  }}
                />
              </Box>
            )}
  
              <Box
                sx={{
                  backgroundColor: "#fce4ec",
                  borderRadius: "12px",
                  p: 3,
                  border: '1px solid #f48fb1'
                }}
              >
              <Typography variant="h6" sx={{ color: "#5500aa", fontWeight: 700, mb: 2 }}>
                🔗 GitHub Repository
              </Typography>
              {githubLink ? (
                <Link 
                  href={githubLink} 
                  target="_blank" 
                  rel="noopener"
                  sx={{
                    color: '#5500aa',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
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
                    setGithubLink(tempGithubLink.trim());
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#ddaaff' },
                      '&:hover fieldset': { borderColor: '#5500aa' },
                      '&.Mui-focused fieldset': { borderColor: '#5500aa' }
                    }
                  }}
                />
              )}
            </Box>
  
            {isProjectReadyToComplete() && !showConfirmComplete && (
              <Button
                variant="contained"
                disabled={!isProjectReadyToComplete()}
                sx={{ 
                  mt: 3,
                  background: 'linear-gradient(45deg, #5500aa, #7733bb)',
                  fontWeight: 600,
                  width: '100%',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4a0099, #662aa6)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(85, 0, 170, 0.2)'
                  }
                }}
                onClick={() => setShowConfirmComplete(true)}
              >
                Complete Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
  
      {showConfirmComplete && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1300,
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 24px 48px rgba(85, 0, 170, 0.2)",
            p: 4,
            width: "90%",
            maxWidth: 400,
            textAlign: "center",
            animation: 'fadeIn 0.3s ease-out',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translate(-50%, -48%)'
              },
              to: {
                opacity: 1,
                transform: 'translate(-50%, -50%)'
              }
            }
          }}
        >
          <Typography variant="h6" sx={{ color: "#5500aa", fontWeight: 700, mb: 2 }}>
            🎉 Ready to Complete?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            You've completed all tasks and added your GitHub repo. Mark this project as done?
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #5500aa, #7733bb)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a0099, #662aa6)',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={handleProjectComplete}
            >
              Yes, Complete!
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: '#5500aa',
                borderColor: '#5500aa',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#7733bb',
                  backgroundColor: '#f8f5ff'
                }
              }}
              onClick={() => setShowConfirmComplete(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Projects;