import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ currentQuestion, totalQuestions }) => {
  const progress = ((currentQuestion) / totalQuestions) * 100;
  
  return (
    <Box sx={{ 
      width: "100%", 
      textAlign: "center", 
      mt: 2, 
      p: 2, 
      bgcolor: "white", 
      borderRadius: 2,
      boxShadow: "0 2px 10px rgba(85, 0, 170, 0.1)",
      maxWidth: "700px",
      margin: "16px auto"
    }}>
      <Typography variant="body1" sx={{ fontWeight: "bold", color: "#5500aa" }}>
        Question {currentQuestion} of {totalQuestions}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mt: 1,
          height: 10,
          borderRadius: 5,
          bgcolor: "#f0e6ff",
          "& .MuiLinearProgress-bar": {
            bgcolor: "#5500aa",
          },
        }}
      />
    </Box>
  );
};

export default QuizProgress;
