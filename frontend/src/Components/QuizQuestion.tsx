import React from "react";

interface Question {
  question: string;
  answers: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
}

interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  userAnswer: string; // ✅ Accepts only the current question's answer
  onAnswer: (selectedAnswer: string) => void; // ✅ No need to pass questionIndex
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  userAnswer,
  onAnswer,
}) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Question {questionIndex + 1}</h2>
      <p>{question.question}</p>

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {Object.entries(question.answers).map(([key, value]) => (
          <li key={key} style={{ margin: "10px 0" }}>
            <button
              onClick={() => onAnswer(key)}
              style={{
                padding: "10px 15px",
                width: "100%",
                backgroundColor: userAnswer === key ? "#4caf50" : "#b39ddb",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {key}: {value}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizQuestion;
