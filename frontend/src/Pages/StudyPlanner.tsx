import React, { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Checkbox,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const StudyPlanner = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

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
      const modulesRef = collection(db, `users/${uid}/modules`); // ✅ Correct Firestore path
      const querySnapshot = await getDocs(modulesRef);

      if (!querySnapshot.empty) {
        const modulesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            studyTasks: data.studyPlan?.studyTasks || [], // ✅ Extract studyTasks from studyPlan
            exercise: data.studyPlan?.exercise || "", // ✅ Extract exercise (string)
          };
        });

        console.log("✅ Modules Retrieved:", modulesData);
        setModules(modulesData);
      } else {
        console.warn("⚠️ No modules found for user.");
      }
    } catch (error) {
      console.error("❌ Error fetching modules:", error);
    }
    setLoading(false);
  };

  const toggleExpand = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleTaskCheck = async (moduleId: string, taskIndex: number) => {
    if (!userId) return;

    const moduleRef = doc(db, `users/${userId}/modules/${moduleId}`);
    const moduleSnap = await getDoc(moduleRef);
    if (!moduleSnap.exists()) return;

    const moduleData = moduleSnap.data();
    const studyTasks = moduleData.studyPlan?.studyTasks || [];

    // ✅ Toggle checkbox status
    studyTasks[taskIndex].completed = !studyTasks[taskIndex].completed;

    await updateDoc(moduleRef, { "studyPlan.studyTasks": studyTasks });

    // ✅ Refresh UI
    setModules((prev) =>
      prev.map((mod) =>
        mod.id === moduleId ? { ...mod, studyTasks } : mod
      )
    );
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>📚 Study Planner</Typography>

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
                      <ListItemText
                        primary={module.name}
                        secondary={
                          module.studyTasks.length
                            ? "You have study tasks for this module."
                            : "Take a quiz to generate a study plan!"
                        }
                      />
                      {module.studyTasks.length ? (
                        expandedModule === module.id ? <ExpandLess /> : <ExpandMore />
                      ) : null}
                    </ListItem>

                    <Collapse in={expandedModule === module.id} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 4 }}>
                        
                        {/* 🔥 Study Tasks (Checkable) */}
                        {module.studyTasks.length > 0 && (
                          <>
                            <Typography sx={{ mt: 2, fontWeight: "bold" }}>📖 Study Tasks:</Typography>
                            {module.studyTasks.map((task: any, index: number) => (
                              <ListItem 
                                key={index} 
                                sx={{ 
                                  pl: 4, 
                                  backgroundColor: "#2a2a2a", 
                                  borderRadius: "8px", 
                                  mb: 1,
                                  color: "#fff"
                                }}
                              >
                                <Checkbox
                                  checked={task.completed || false}
                                  onChange={() => handleTaskCheck(module.id, index)}
                                />
                                <ListItemText primary={task.description || "Unnamed Task"} />
                              </ListItem>
                            ))}
                          </>
                        )}

                        {/* 🔥 Exercise (Single String) */}
                        {module.exercise && (
                          <>
                            <Typography sx={{ mt: 2, fontWeight: "bold" }}>📝 Exercise:</Typography>
                            <ListItem 
                              sx={{ 
                                pl: 4, 
                                backgroundColor: "#2a2a2a", 
                                borderRadius: "8px", 
                                mb: 1,
                                color: "#fff"
                              }}
                            >
                              <ListItemText primary={module.exercise} />
                            </ListItem>
                          </>
                        )}

                        {/* ✅ Retake Quiz Button (Only shows when all tasks are completed) */}
                        {module.studyTasks.length > 0 &&
                          module.studyTasks.every((task: any) => task.completed) && (
                            <Button
                              variant="contained"
                              color="primary"
                              sx={{ m: 2 }}
                              onClick={() => console.log("Retake quiz logic here")}
                            >
                              Retake Quiz
                            </Button>
                          )}
                      </List>
                    </Collapse>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))
          ) : (
            <Typography>No modules found. Add a module and take a quiz to start planning!</Typography>
          )}
        </List>
      )}
    </Container>
  );
};

export default StudyPlanner;
