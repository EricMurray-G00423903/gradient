import { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Box, List, Snackbar } from "@mui/material";
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
      <Typography variant="h4" color="primary" gutterBottom>
        {userName ? `Welcome, ${userName}!` : "Welcome Back!"}
      </Typography>

      {!isCourseSet ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="secondary">Enter Your Course</Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Course Name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => e.key === "Enter" && handleSetCourse()}
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSetCourse}>
            Save Course
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" color="primary">{course}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Your Modules</Typography>

          {modules.length === 0 ? (
            <Typography color="textSecondary">No modules added yet.</Typography>
          ) : (
            <List sx={{ mt: 2 }}>
              {modules.map((module) => (
                <ModuleCard 
                  key={module.id} 
                  id={module.id} 
                  name={module.name} 
                  proficiency={module.proficiency} 
                  hasBeenTested={module.hasBeenTested}
                  ready={module.ready} // Pass ready flag to ModuleCard; it should disable navigation if not ready.
                />
              ))}
            </List>
          )}

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Module Name"
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
              <Button variant="contained" color="secondary" onClick={handleAddModule}>Add Module</Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Snackbar for module creation status */}
      <Snackbar
        open={moduleSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setModuleSnackbarOpen(false)}
        message={moduleSnackbarMessage}
      />
    </Container>
  );
};

export default Modules;
