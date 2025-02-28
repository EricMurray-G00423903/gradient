import React from "react";
import { Box, Typography, Button, List, ListItem, ListItemText } from "@mui/material";

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
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" color="primary">
        Quiz Completed!
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        You scored {correctAnswers} out of {totalQuestions}!
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Strong Topics 💪</Typography>
        {strongTopics.length > 0 ? (
          <List>
            {strongTopics.map((topic) => (
              <ListItem key={topic}>
                <ListItemText primary={topic} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No strong topics yet. Keep practicing!</Typography>
        )}

        <Typography variant="h6" sx={{ mt: 2 }}>Weak Topics ⚠️</Typography>
        {weakTopics.length > 0 ? (
          <List>
            {weakTopics.map((topic) => (
              <ListItem key={topic}>
                <ListItemText primary={topic} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No weak topics detected. Great job!</Typography>
        )}
      </Box>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={onFinish}>
          Return to Modules
        </Button>
      </Box>
    </Box>
  );
};

export default QuizResults;
