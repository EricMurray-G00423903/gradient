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
    <Box sx={{ textAlign: "center", mt: 4, maxWidth: "600px", mx: "auto", p: 3, borderRadius: 3, bgcolor: "#1e1e1e", color: "white", boxShadow: 3 }}>
      <Typography variant="h4" color="primary">
        Quiz Completed!
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        You scored <strong>{correctAnswers}</strong> out of <strong>{totalQuestions}</strong>!
      </Typography>

      <Divider sx={{ my: 3, bgcolor: "#b39ddb" }} />

      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: "#4caf50" }}>💪 Strong Topics</Typography>
        {strongTopics.length > 0 ? (
          <List>
            {strongTopics.map((topic) => (
              <ListItem key={topic} sx={{ bgcolor: "#2e7d32", borderRadius: 1, mb: 1 }}>
                <ListItemText primary={topic} sx={{ color: "white", textAlign: "center" }} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ color: "#ffeb3b" }}>No strong topics yet. Keep practicing!</Typography>
        )}
      </Box>

      <Divider sx={{ my: 3, bgcolor: "#b39ddb" }} />

      <Box>
        <Typography variant="h6" sx={{ mb: 1, color: "#ff9800" }}>⚠️ Weak Topics</Typography>
        {weakTopics.length > 0 ? (
          <List>
            {weakTopics.map((topic) => (
              <ListItem key={topic} sx={{ bgcolor: "#b71c1c", borderRadius: 1, mb: 1 }}>
                <ListItemText primary={topic} sx={{ color: "white", textAlign: "center" }} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ color: "#ffeb3b" }}>No weak topics detected. Great job!</Typography>
        )}
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={onFinish} sx={{ fontWeight: "bold", fontSize: "16px" }}>
          🔄 Retry Quiz
        </Button>
        <Button variant="contained" color="secondary" onClick={() => window.location.href = "/modules"} sx={{ fontWeight: "bold", fontSize: "16px" }}>
          📚 Back to Modules
        </Button>
      </Box>
    </Box>
  );
};

export default QuizResults;
