import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface Question {
  question: string;
  answers: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
}

interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  userAnswer: string;
  onAnswer: (selectedAnswer: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  userAnswer,
  onAnswer,
}) => {
  return (
    <Box sx={{ 
      textAlign: "center", 
      padding: "20px", 
      backgroundColor: "white", 
      borderRadius: "16px", 
      boxShadow: "0 4px 20px rgba(85, 0, 170, 0.1)",
      maxWidth: "700px",
      margin: "0 auto"
    }}>
      <Typography variant="h5" sx={{ color: "#5500aa", mb: 2, fontWeight: "600" }}>
        Question {questionIndex + 1}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, fontSize: "18px" }}>
        {question.question}
      </Typography>

      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "12px",
        maxWidth: "500px",
        margin: "0 auto" 
      }}>
        {Object.entries(question.answers).map(([key, value]) => (
          <Button
            key={key}
            onClick={() => onAnswer(key)}
            variant={userAnswer === key ? "contained" : "outlined"}
            sx={{
              p: 2,
              textAlign: "left",
              justifyContent: "flex-start",
              borderRadius: "8px",
              backgroundColor: userAnswer === key ? "#5500aa" : "transparent",
              borderColor: "#ddaaff",
              color: userAnswer === key ? "white" : "#5500aa",
              "&:hover": {
                backgroundColor: userAnswer === key ? "#5500aa" : "#f8f5ff",
                borderColor: "#5500aa"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>
              {key}: {value}
            </Typography>
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default QuizQuestion;
