import React from "react";
import { LinearProgress, Box, Typography } from "@mui/material";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ currentQuestion, totalQuestions }) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100; // ✅ Ensures 100% on last question

  return (
    <Box sx={{ width: "100%", textAlign: "center", mt: 2, p: 1, bgcolor: "#1e1e1e", borderRadius: 2 }}>
      <Typography variant="body2" sx={{ color: "white", fontWeight: "bold" }}>
        Question {currentQuestion} of {totalQuestions}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mt: 1,
          height: 10,
          borderRadius: 5,
          bgcolor: "grey.800",
          "& .MuiLinearProgress-bar": {
            bgcolor: "#b39ddb",
          },
        }}
      />
    </Box>
  );
};

export default QuizProgress;
