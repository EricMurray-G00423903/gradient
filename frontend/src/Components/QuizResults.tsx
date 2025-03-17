import React from "react";
import { Box, Typography, Button, List, ListItem, ListItemText, Divider } from "@mui/material";

interface QuizResultsProps {
  module: { name: string };
  userAnswers: { [key: number]: string };
  questions: {
    question: string;
    answers: { A: string; B: string; C: string; D: string };
    correctAnswer: string;
    topic: string;
  }[];
  onFinish: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ module, userAnswers, questions, onFinish }) => {
  const totalQuestions = questions.length;
  const correctAnswers = Object.keys(userAnswers).filter(
    (index) => userAnswers[parseInt(index)] === questions[parseInt(index)].correctAnswer
  ).length;

  // Categorize strong and weak topics
  const topicScores: { [topic: string]: { correct: number; total: number } } = {};

  questions.forEach((q, index) => {
    if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
    topicScores[q.topic].total += 1;
    if (userAnswers[index] === q.correctAnswer) {
      topicScores[q.topic].correct += 1;
    }
  });

  const strongTopics = Object.entries(topicScores)
    .filter(([_, data]) => data.correct / data.total >= 0.75)
    .map(([topic]) => topic);

  const weakTopics = Object.entries(topicScores)
    .filter(([_, data]) => data.correct / data.total < 0.75)
    .map(([topic]) => topic);

  return (
    <Box sx={{ 
      textAlign: "center", 
      mt: 4, 
      maxWidth: "600px", 
      mx: "auto", 
      p: 4, 
      borderRadius: 3, 
      bgcolor: "#ffffff", 
      color: "#333333", 
      boxShadow: "0 8px 24px rgba(85, 0, 170, 0.1)" 
    }}>
      <Typography variant="h4" color="#5500aa" fontWeight="bold">
        Quiz Completed!
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        You scored <strong style={{ color: "#5500aa" }}>{correctAnswers}</strong> out of <strong>{totalQuestions}</strong>!
      </Typography>

      <Divider sx={{ my: 3, bgcolor: "#ddaaff" }} />

      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: "#4caf50", fontWeight: "600" }}>💪 Strong Topics</Typography>
        {strongTopics.length > 0 ? (
          <List>
            {strongTopics.map((topic) => (
              <ListItem key={topic} sx={{ 
                bgcolor: "#f0faf0", 
                borderRadius: 1, 
                mb: 1,
                border: "1px solid #4caf50"
              }}>
                <ListItemText primary={topic} sx={{ color: "#333", textAlign: "center" }} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ color: "#f57c00" }}>No strong topics yet. Keep practicing!</Typography>
        )}
      </Box>

      <Divider sx={{ my: 3, bgcolor: "#ddaaff" }} />

      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: "#f57c00", fontWeight: "600" }}>⚠️ Weak Topics</Typography>
        {weakTopics.length > 0 ? (
          <List>
            {weakTopics.map((topic) => (
              <ListItem key={topic} sx={{ 
                bgcolor: "#fff5f0", 
                borderRadius: 1, 
                mb: 1,
                border: "1px solid #f57c00"
              }}>
                <ListItemText primary={topic} sx={{ color: "#333", textAlign: "center" }} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ color: "#4caf50" }}>No weak topics detected. Great job!</Typography>
        )}
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.href = "/modules"} 
          sx={{ 
            fontWeight: "bold", 
            fontSize: "16px", 
            px: 4, 
            py: 1.5,
            borderRadius: "8px" 
          }}
        >
          📚 Back to Modules
        </Button>
      </Box>
    </Box>
  );
};

export default QuizResults;
