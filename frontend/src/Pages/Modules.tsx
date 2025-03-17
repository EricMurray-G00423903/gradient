import { useState, useEffect } from "react";
import { 
  Container, Typography, TextField, Button, Box, List, Snackbar,
  Paper
} from "@mui/material";
import { getUserCourseAndModules, setUserCourse, addModule } from "../Utils/FirestoreService";
import ModuleCard from "../Components/ModuleCard";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";


const Modules = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [course, setCourse] = useState<string>("");
  const [isCourseSet, setIsCourseSet] = useState<boolean>(false);
  const [modules, setModules] = useState<{ id: string; name: string; proficiency: number; hasBeenTested: boolean; ready: boolean }[]>([]);
  const [newModule, setNewModule] = useState<string>("");
  const [moduleSnackbarOpen, setModuleSnackbarOpen] = useState(false);
  const [moduleSnackbarMessage, setModuleSnackbarMessage] = useState("");
  const navigate = useNavigate();

  // Fetch user's course & modules when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        
        const { name, course, modules } = await getUserCourseAndModules(user.uid);
        
        if (name) setUserName(name);
        if (course) {
          setCourse(course);
          setIsCourseSet(true);
        }
        if (modules.length > 0) {
          setModules(modules.map((mod) => ({
            id: mod.id,
            name: mod.name,
            proficiency: mod.proficiency,
            hasBeenTested: mod.hasBeenTested ?? false,
            ready: true // mark existing modules as ready
          })));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSetCourse = async () => {
    if (!course.trim()) return;
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      
      await setUserCourse(user.uid, course);
      setIsCourseSet(true);
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.trim()) return;
    
    // Create a temporary module card with a temporary id and mark as not ready
    const tempId = "temp-" + Date.now();
    setModules((prevModules) => [
      ...prevModules,
      { id: tempId, name: newModule, proficiency: 0, hasBeenTested: false, ready: false }
    ]);
    
    // Show "Creating Module!" snackbar
    setModuleSnackbarMessage("Creating Module!");
    setModuleSnackbarOpen(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      
      // Call Firestore to add module and get the new module ID
      const newModuleId = (await addModule(user.uid, newModule) as unknown) as string;
      
      // Update the temporary module card with the real id and mark as ready
      setModules((prevModules) =>
        prevModules.map((mod) =>
          mod.id === tempId ? { ...mod, id: newModuleId, ready: true } : mod
        )
      );
      
      // Re-fetch modules to ensure updated data is used immediately
      const { modules: fetchedModules } = await getUserCourseAndModules(user.uid);
      setModules(
        fetchedModules.map((mod) => ({
          id: mod.id,
          name: mod.name,
          proficiency: mod.proficiency,
          hasBeenTested: mod.hasBeenTested ?? false,
          ready: true
        }))
      );
      
      // Clear the module input field
      setNewModule("");
      
      // Show "Module Created Successfully" snackbar
      setModuleSnackbarMessage("Module Created Successfully");
      setModuleSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4" color="#5500aa" fontWeight="bold" gutterBottom>
        {userName ? `Welcome, ${userName}!` : "Welcome Back!"}
      </Typography>

      {!isCourseSet ? (
        <Paper sx={{ 
          mt: 3, 
          p: 3, 
          borderRadius: '12px', 
          boxShadow: '0 4px 16px rgba(85, 0, 170, 0.1)',
          backgroundColor: "#ffffff",
        }}>
          <Typography variant="h6" color="#ddaaff">Enter Your Course</Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Course Name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#5500aa',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#5500aa',
              },
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSetCourse()}
          />
          <Button 
            variant="contained" 
            sx={{ 
              mt: 2, 
              bgcolor: "#5500aa", 
              '&:hover': { bgcolor: "#7722cc" },
              borderRadius: '8px',
            }} 
            onClick={handleSetCourse}
          >
            Save Course
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" sx={{ color: "#5500aa", fontWeight: "bold" }}>{course}</Typography>
          <Typography variant="h6" sx={{ mt: 2, color: "#666" }}>Your Modules</Typography>

          {modules.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>No modules added yet.</Typography>
          ) : (
            <List sx={{ mt: 2 }}>
              {modules.map((module) => (
                <ModuleCard 
                  key={module.id} 
                  id={module.id} 
                  name={module.name} 
                  proficiency={module.proficiency} 
                  hasBeenTested={module.hasBeenTested}
                  ready={module.ready}
                />
              ))}
            </List>
          )}

          <Paper sx={{ 
            mt: 4, 
            p: 3, 
            borderRadius: '12px', 
            boxShadow: '0 4px 16px rgba(85, 0, 170, 0.1)',
            backgroundColor: "#ffffff",
          }}>
            <Typography variant="h6" sx={{ color: "#5500aa", mb: 2 }}>Add New Module</Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Module Name"
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#5500aa',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#5500aa',
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: "#5500aa", 
                  '&:hover': { bgcolor: "#7722cc" },
                  borderRadius: '8px',
                  px: 4,
                  py: 1,
                }} 
                onClick={handleAddModule}
              >
                Add Module
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Snackbar for module creation status */}
      <Snackbar
        open={moduleSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setModuleSnackbarOpen(false)}
        message={moduleSnackbarMessage}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#5500aa',
          }
        }}
      />
    </Container>
  );
};

export default Modules;
