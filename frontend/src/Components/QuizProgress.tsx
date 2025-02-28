import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <Box sx={{ width: "100%", textAlign: "center", mt: 2 }}>
      <Typography variant="body2">
        Question {currentQuestion} of {totalQuestions}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, height: 8, borderRadius: 5 }} />
    </Box>
  );
};

export default QuizProgress;