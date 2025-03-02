import React from "react";
import { Timestamp } from "firebase/firestore";



interface QuizIntroProps {
  module: {
    name: string;
    description?: string;
    lastTested?: Timestamp | null;
    proficiency?: number;
  };
  onStart: () => void;
}

const formatFirestoreTimestamp = (timestamp: Timestamp | null) => {
  if (!timestamp) return "Never";
  return new Date(timestamp.seconds * 1000).toLocaleString(); // Convert Firestore Timestamp to readable format
};


const QuizIntro: React.FC<QuizIntroProps> = ({ module, onStart }) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>{module.name} Quiz</h2>
      <p><strong>Last Test:</strong> {formatFirestoreTimestamp(module.lastTested || null)}</p>
      <p><strong>Current Score:</strong> {module.proficiency || 0}%</p>
      <p><strong>Description:</strong> {module.description ? `${module.description.substring(0, 50)}...` : "No description available"}</p>
      
      <button onClick={onStart} style={{ marginTop: "20px", padding: "10px 15px", fontSize: "16px", cursor: "pointer" }}>
        Start Quiz
      </button>
    </div>
  );
};

export default QuizIntro;
