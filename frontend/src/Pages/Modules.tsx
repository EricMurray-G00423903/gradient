import { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Box, List } from "@mui/material";
import { getUserCourseAndModules, setUserCourse, addModule } from "../Utils/FirestoreService";
import ModuleCard from "../Components/ModuleCard";

const HARDCODED_UID = "LDkrfJqOSvV59ddYaLTUdI9lgWB2"; // Replace with actual Firebase UID

const Modules = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [course, setCourse] = useState<string>("");
  const [isCourseSet, setIsCourseSet] = useState<boolean>(false);
  const [modules, setModules] = useState<{ id: string; name: string; proficiency: number; hasTakenQuiz: boolean }[]>([]);
  const [newModule, setNewModule] = useState<string>("");

  // Fetch user's course & modules when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { name, course, modules } = await getUserCourseAndModules(HARDCODED_UID);
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
            hasTakenQuiz: mod.hasBeenTested ?? false, // ✅ Ensures it always exists
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
      await setUserCourse(HARDCODED_UID, course);
      setIsCourseSet(true);
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.trim()) return;
    try {
      await addModule(HARDCODED_UID, newModule);
      setModules((prevModules) => [...prevModules, { id: Date.now().toString(), name: newModule, proficiency: 0, hasTakenQuiz: false }]);
      setNewModule("");
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };

  const handleTakeQuiz = (moduleId: string) => {
    console.log(`Redirecting to quiz for module: ${moduleId}`);
    window.location.href = `/quiz?moduleId=${moduleId}`;
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
                <ModuleCard key={module.id} {...module} onTakeQuiz={handleTakeQuiz} />
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
    </Container>
  );
};

export default Modules;