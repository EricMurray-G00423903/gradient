import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
  LinearProgress,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getUserCourseAndModules } from "../Utils/FirestoreService";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Fetch user's modules when the component mounts
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await getUserCourseAndModules(user.uid);
        setUserData(data);
        setModules(data.modules || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress sx={{ color: "#5500aa" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: 10 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" color="#5500aa" fontWeight="bold" gutterBottom>
          Welcome, {userData?.name || "Student"}!
        </Typography>
        {userData?.course && (
          <Typography variant="body1" color="text.secondary">
            {userData.course}
          </Typography>
        )}
      </Box>

      {/* Modules Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="#5500aa">
            Your Modules
          </Typography>
          <Button color="primary" onClick={() => navigate("/modules")} sx={{ fontWeight: "bold" }}>
            See All
          </Button>
        </Box>
        
        <Box
          sx={{
            display: "flex",
            overflow: "auto",
            pb: 1,
            // Hide scrollbar
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {modules && modules.length > 0 ? (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                minWidth: "min-content",
                "& > *": {
                  minWidth: isMobile ? "250px" : "280px",
                },
              }}
            >
              {modules.slice(0, 5).map((module: any) => (
                <Card
                  key={module.id}
                  onClick={() => navigate(`/module-details?id=${module.id}`)}
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(85, 0, 170, 0.1)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(85, 0, 170, 0.15)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {module.name}
                    </Typography>

                    {module.proficiency !== undefined && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Proficiency: {module.proficiency}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={module.proficiency || 0}
                          sx={{
                            mt: 0.5,
                            height: 8,
                            borderRadius: 2,
                            bgcolor: "#f0e6ff",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#5500aa",
                            },
                          }}
                        />
                        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {module.hasBeenTested && (
                            <Chip
                              label="Tested"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.625rem",
                                bgcolor: "#f0e6ff",
                                color: "#5500aa",
                              }}
                            />
                          )}
                          {module.studyPlan?.studyTasks?.some((task: any) => !task?.completed) && (
                            <Chip
                              label="Study Plan"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.625rem",
                                bgcolor: "#fff0e6",
                                color: "#f57c00",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card
              sx={{
                width: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(85, 0, 170, 0.1)",
                p: 3,
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No modules found
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/modules")}
                  sx={{ mt: 1, fontWeight: "bold", borderRadius: "8px" }}
                >
                  Add Your First Module
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Quick Info Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#5500aa" gutterBottom>
          Quick Access
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(85, 0, 170, 0.1)",
                height: "100%",
                bgcolor: "#f8f5ff",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Study Planner
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                    Review your study tasks and track your progress
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate("/study-planner")}
                    sx={{ alignSelf: "flex-start", fontWeight: "bold", borderRadius: "8px" }}
                  >
                    Open Study Planner
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(85, 0, 170, 0.1)",
                height: "100%",
                bgcolor: "#f8f5ff",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Ideas
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                    Generate AI-powered project ideas based on your modules
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate("/projects")}
                    sx={{ alignSelf: "flex-start", fontWeight: "bold", borderRadius: "8px" }}
                  >
                    Explore Projects
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Daily Tip */}
      <Card
        sx={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(85, 0, 170, 0.1)",
          bgcolor: "#5500aa",
          color: "white",
          mb: 5,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💡 Daily Learning Tip
          </Typography>
          <Typography variant="body2">
            Regular short study sessions are more effective than cramming. Try to review your modules for just 20 minutes each day!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Home;