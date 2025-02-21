import { useState } from "react";
import { Container, Typography, TextField, Button, Box, List, ListItem, ListItemText } from "@mui/material";

const Modules = () => {
  const [course, setCourse] = useState<string>(""); // Store course name
  const [isCourseSet, setIsCourseSet] = useState<boolean>(false); // Track if course is set
  const [modules, setModules] = useState<string[]>([]); // Store modules
  const [newModule, setNewModule] = useState<string>(""); // Input for new module

  const handleSetCourse = () => {
    if (!course.trim()) return;
    setIsCourseSet(true); // Confirm course selection
  };

  const handleAddModule = () => {
    if (!newModule.trim()) return;
    setModules((prevModules) => [...prevModules, newModule]); // Add new module
    setNewModule(""); // Clear input
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Welcome Back, |Username|
      </Typography>

      {!isCourseSet ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="secondary">
            Enter Your Course
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Course Name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => e.key === "Enter" && handleSetCourse()} // Allow pressing Enter
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSetCourse}>
            Save Course
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" color="primary">
            {course}
          </Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>
            Your Modules
          </Typography>
          {modules.length === 0 && <Typography color="textSecondary">No modules added yet.</Typography>}

          <List sx={{ mt: 2 }}>
            {modules.map((mod, index) => (
              <ListItem key={index} sx={{ bgcolor: "background.paper", borderRadius: 1, mb: 1 }}>
                <ListItemText primary={mod} />
              </ListItem>
            ))}
          </List>

          <TextField
            fullWidth
            variant="outlined"
            label="Module Name"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()} // Allow pressing Enter
          />
          <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleAddModule}>
            Add Module
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Modules;
