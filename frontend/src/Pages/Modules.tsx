import { useState } from "react";
import { 
  Container, Typography, TextField, Button, Box, List, ListItem, 
  ListItemText, CircularProgress, Card, CardContent 
} from "@mui/material";

const FIREBASE_FUNCTION_URL = "http://127.0.0.1:5001/gradient-3b33e/us-central1/askAI"; // Replace with your local Firebase function URL

const Modules = () => {
  const [course, setCourse] = useState<string>(""); // Store course name
  const [isCourseSet, setIsCourseSet] = useState<boolean>(false); // Track if course is set
  const [modules, setModules] = useState<string[]>([]); // Store modules
  const [newModule, setNewModule] = useState<string>(""); // Input for new module
  const [aiResponse, setAiResponse] = useState<string | null>(null); // AI-generated content
  const [loading, setLoading] = useState<boolean>(false); // Loading state for AI request

  const handleSetCourse = () => {
    if (!course.trim()) return;
    setIsCourseSet(true); // Confirm course selection
  };

  const handleAddModule = () => {
    if (!newModule.trim()) return;
    setModules((prevModules) => [...prevModules, newModule]); // Add new module
    setNewModule(""); // Clear input
  };

  const askAI = async () => {
    if (!isCourseSet || modules.length === 0) return;
    setLoading(true);
    setAiResponse(null);

    try {
      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `I am studying ${course}. Here are my modules: ${modules.join(", ")}. 
            Provide a very brief description of each module and list three main study points for each.` 
        }),
      });

      const data = await response.json();
      setAiResponse(data.reply);
    } catch (error) {
      setAiResponse("Error communicating with AI.");
    }

    setLoading(false);
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
            onKeyDown={(e) => e.key === "Enter" && handleSetCourse()}
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

          <Box sx={{ mt: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                label="Module Name"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            />

                {/* Buttons now properly aligned */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
                    <Button variant="contained" color="secondary" onClick={handleAddModule}>
                        Add Module
                    </Button>
                    <Button variant="contained" color="primary" onClick={askAI}>
                        Send to AI
                    </Button>
                </Box>
            </Box>

          {loading && <CircularProgress sx={{ mt: 2 }} />}

          {aiResponse && (
            <Card sx={{ mt: 4, p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="secondary" gutterBottom>
                  AI Study Guide
                </Typography>
                <Typography variant="body1">{aiResponse}</Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Modules;
