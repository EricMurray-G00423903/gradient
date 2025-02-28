import React from "react";

interface Question {
  question: string;
  answers: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
}

interface QuizQuestionProps {
  question: Question; // ✅ Accepts a single question instead of an array
  questionIndex: number;
  userAnswers: { [key: number]: string };
  onAnswer: (questionIndex: number, selectedAnswer: string) => void;
  onFinish: () => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  userAnswers,
  onAnswer,
  onFinish,
}) => {
  const handleAnswerClick = (answerKey: string) => {
    onAnswer(questionIndex, answerKey);
  };

  return (
    <div>
      <h2>Question {questionIndex + 1}</h2>
      <p>{question.question}</p>
      <ul>
        {Object.entries(question.answers).map(([key, value]) => (
          <li key={key}>
            <button onClick={() => handleAnswerClick(key)}>
              {key}: {value}
            </button>
          </li>
        ))}
      </ul>
      {questionIndex === 9 && <button onClick={onFinish}>Finish Quiz</button>}
    </div>
  );
};

export default QuizQuestion;
