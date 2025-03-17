import React from "react";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, Typography, Button, Box, CircularProgress } from "@mui/material";

interface QuizIntroProps {
  module: {
    name: string;
    description?: string;
    lastTested?: Timestamp | null;
    proficiency?: number;
  };
  onStart: () => void;
  loading?: boolean;
}

const formatFirestoreTimestamp = (timestamp: Timestamp | null) => {
  if (!timestamp) return "Never";
  return new Date(timestamp.seconds * 1000).toLocaleString(); // Convert Firestore Timestamp to readable format
};

const QuizIntro: React.FC<QuizIntroProps> = ({ module, onStart, loading }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Card sx={{ 
        maxWidth: 400, 
        p: 3, 
        textAlign: "center", 
        boxShadow: '0 8px 24px rgba(85, 0, 170, 0.15)', 
        borderRadius: 3,
        background: '#ffffff',
      }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" color="#5500aa" gutterBottom>
            {module.name} Quiz
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            <strong>Last Test:</strong> {formatFirestoreTimestamp(module.lastTested || null)}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            <strong>Current Score:</strong> {module.proficiency || 0}%
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Description:</strong> {module.description ? `${module.description.substring(0, 50)}...` : "No description available"}
          </Typography>
          
          {loading ? (
            <Box mt={2} display="flex" justifyContent="center">
              <CircularProgress sx={{ color: "#5500aa" }} />
            </Box>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onStart} 
              sx={{ 
                mt: 2, 
                px: 4, 
                py: 1, 
                fontSize: "16px", 
                fontWeight: "bold",
                borderRadius: '8px',
              }}
            >
              Start Quiz
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizIntro;