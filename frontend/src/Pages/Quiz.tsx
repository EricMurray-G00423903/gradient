import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Box, CircularProgress, Typography } from "@mui/material";
import { getModuleById } from "../Utils/FirestoreService";
import QuizIntro from "../Components/QuizIntro";
import QuizQuestion from "../Components/QuizQuestion";
import QuizResults from "../Components/QuizResults";
import QuizProgress from "../Components/QuizProgress";

const HARDCODED_UID = "LDkrfJqOSvV59ddYaLTUdI9lgWB2"; // Temporary for testing

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id") || "";
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState<any>(null);
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  useEffect(() => {
    if (!moduleId) {
      console.error("No module ID found.");
      navigate("/modules");
      return;
    }

    const fetchModule = async () => {
      try {
        const data = await getModuleById(HARDCODED_UID, moduleId);
        if (data) {
          setModuleData(data);
        }
      } catch (error) {
        console.error("Error fetching module:", error);
      }
    };

    fetchModule();
  }, [moduleId, navigate]);

  const startQuiz = async () => {
    if (!moduleData) return;

    setLoading(true);
    setError(null);
    setQuizQuestions([]); // ✅ Clears old questions before fetching new ones
    setUserAnswers({}); // ✅ Reset user answers
    setCurrentQuestionIndex(0); // ✅ Reset question index
    //http://127.0.0.1:5001/gradient-3b33e/us-central1/generateQuizQuestions
    //https://generatequizquestions-talutcxweq-uc.a.run.app
    try {
      const response = await fetch("http://127.0.0.1:5001/gradient-3b33e/us-central1/generateQuizQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName: moduleData.name,
          proficiencyScore: moduleData.proficiency || 0,
          moduleDescription: moduleData.description || "No description provided.",
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch quiz questions");

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) throw new Error("Invalid response format from AI");

      setQuizQuestions(data.questions);
      setStep("questions");
    } catch (err) {
      console.error("Quiz API Error:", err);
      setError("Failed to generate quiz. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedAnswer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer, // ✅ Store answer for current question
    }));
  
    // ✅ Move to next question after storing answer
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 500); // ⏳ Small delay for better UX
    } else {
      setTimeout(() => {
        setStep("results"); // ✅ End quiz when reaching last question
      }, 500);
    }
  };
  

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {step === "intro" && moduleData && (
          <>
            <QuizIntro module={moduleData} onStart={startQuiz} />
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
          </>
        )}

        {step === "questions" && quizQuestions.length > 0 && (
          <>
            <QuizProgress 
              currentQuestion={currentQuestionIndex + 1} 
              totalQuestions={quizQuestions.length} 
            />
            <QuizQuestion
            question={quizQuestions[currentQuestionIndex]} 
            questionIndex={currentQuestionIndex}
            userAnswer={userAnswers[currentQuestionIndex] || ""} // ✅ Fix: Pass single answer
            onAnswer={handleAnswer} 
            />
          </>
        )}

        {step === "results" && (
          <QuizResults 
            module={moduleData} 
            userAnswers={userAnswers} 
            questions={quizQuestions} 
            onFinish={() => navigate("/modules")} // ✅ Fix: Handle quiz completion
          />
        )}
      </Box>
    </Container>
  );
};

export default Quiz;
