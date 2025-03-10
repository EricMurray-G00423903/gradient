import React, { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Projects = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [projectDescription, setProjectDescription] = useState<string | null>(null);
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
        console.warn("⚠️ No modules found.");
      }
    } catch (error) {
      console.error("❌ Error fetching modules:", error);
    }
    setLoading(false);
  };

  const toggleExpand = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const selectModule = (module: any) => {
    setSelectedModule(module);
    setExpandedModule(null); // Close module list
    setProjectDescription(null); // Reset previous project
  };

  const generateProject = async () => {
    if (!selectedModule) {
      console.error("❌ No module selected.");
      return;
    }

    setGenerating(true);
    const requestBody = {
      moduleName: selectedModule.name,
      proficiencyLevel: selectedModule.proficiency || 0,
    };

    console.log("📌 Sending request payload:", requestBody);

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

      console.log("✅ Received AI-generated project:", data);
      setProjectDescription(data.description);
    } catch (error) {
      console.error("❌ Error generating project:", error);
    }
    setGenerating(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>🚀 Projects</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {modules.length > 0 ? (
            modules.map((module) => (
              <React.Fragment key={module.id}>
                <Card sx={{ mb: 2, backgroundColor: "#1e1e1e", borderRadius: "8px" }}>
                  <CardContent>
                    <ListItem 
                      component="div"
                      onClick={() => toggleExpand(module.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <ListItemText primary={module.name} secondary={`Proficiency: ${module.proficiency || 0}%`} />
                      {expandedModule === module.id ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    
                    <Collapse in={expandedModule === module.id} timeout="auto" unmountOnExit>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => selectModule(module)}
                      >
                        Select Module
                      </Button>
                    </Collapse>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))
          ) : (
            <Typography>No modules found. Add a module first!</Typography>
          )}
        </List>
      )}

      {/* Selected Module & Generate Project Button */}
      {selectedModule && (
        <Card sx={{ mt: 4, backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
          <CardContent>
            <Typography variant="h5">{selectedModule.name} - AI Project Idea</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
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

            {generating && <CircularProgress sx={{ mt: 2 }} />}
          </CardContent>
        </Card>
      )}

      {/* AI-Generated Project Description */}
      {projectDescription && (
        <Card sx={{ mt: 4, backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
          <CardContent>
            <Typography variant="h5">💡 Project Idea</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{projectDescription}</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Projects;
